import type {
  DomainPlayerProfile,
  PlayerBiometrics,
  PlayerPitchPosition,
  PlayerPositionsData,
  PlayerProfileStatGroup,
  PlayerSeasonMatchLog,
  FotMobRawPlayerData,
} from "./fotmob-player-profile-types.ts";
import {
  translatePlayerStatGroupTitle,
  translatePlayerStatTitle,
  translateCountryName,
} from "./fotmob-player-stats-translations.ts";

const POSITION_TRANSLATIONS: Record<string, { label: string; short: string }> = {
  keeper: { label: "Portero", short: "POR" }, "right back": { label: "Lateral Derecho", short: "LD" },
  "left back": { label: "Lateral Izquierdo", short: "LI" }, "centre back": { label: "Defensa Central", short: "DFC" },
  "left wing-back": { label: "Carrilero Izquierdo", short: "CAI" }, "right wing-back": { label: "Carrilero Derecho", short: "CAD" },
  "defensive midfielder": { label: "Pivote Defensivo", short: "MCD" }, "central midfielder": { label: "Centrocampista", short: "MC" },
  "attacking midfielder": { label: "Mediapunta", short: "MP" }, "right midfielder": { label: "Interior Derecho", short: "MD" },
  "left midfielder": { label: "Interior Izquierdo", short: "MI" }, "right winger": { label: "Extremo Derecho", short: "ED" },
  "left winger": { label: "Extremo Izquierdo", short: "EI" }, striker: { label: "Delantero Centro", short: "DC" },
  midfielder: { label: "Centrocampista", short: "MC" }, defender: { label: "Defensa", short: "DEF" },
  forward: { label: "Delantero", short: "DEL" }, attacker: { label: "Delantero", short: "DEL" },
};

const DEFAULT_COORDS: Record<string, { x: number; y: number }> = {
  keeper: { x: 50, y: 90 }, "left back": { x: 17, y: 74 }, "right back": { x: 83, y: 74 },
  "centre back": { x: 50, y: 78 }, "left wing-back": { x: 17, y: 58 }, "right wing-back": { x: 83, y: 58 },
  "defensive midfielder": { x: 50, y: 62 }, "central midfielder": { x: 50, y: 46 },
  "left midfielder": { x: 17, y: 42 }, "right midfielder": { x: 83, y: 42 },
  "attacking midfielder": { x: 50, y: 32 }, "left winger": { x: 17, y: 22 },
  "right winger": { x: 83, y: 22 }, striker: { x: 50, y: 16 },
  midfielder: { x: 50, y: 46 }, defender: { x: 50, y: 78 }, forward: { x: 50, y: 16 },
};

function translatePosition(raw: string): { label: string; short: string } {
  const norm = raw.toLowerCase().trim();
  for (const [key, val] of Object.entries(POSITION_TRANSLATIONS)) {
    if (norm.includes(key)) return val;
  }
  return { label: raw, short: raw.slice(0, 3).toUpperCase() };
}

export function parseFotMobPlayerProfile(data: FotMobRawPlayerData): DomainPlayerProfile {
  const infoMap = new Map<string, unknown>();
  let countryCode: string | null = null;

  for (const item of data.playerInformation ?? []) {
    if (item.title) {
      infoMap.set(item.title.toLowerCase(), item.value?.fallback ?? item.value?.key);
    }
    if (item.countryCode) countryCode = item.countryCode;
  }

  const rawFoot = String(infoMap.get("preferred foot") ?? "").toLowerCase();
  const preferredFoot = rawFoot.includes("right")
    ? "Diestro" : rawFoot.includes("left") ? "Zurdo" : rawFoot.includes("both") ? "Ambidiestro" : null;

  const rawContract = infoMap.get("contract end");
  const contractYear =
    typeof rawContract === "object" && rawContract && "utcTime" in rawContract
      ? String((rawContract as { utcTime: string }).utcTime).slice(0, 4)
      : typeof rawContract === "string" ? rawContract.slice(0, 4) : null;

  const biometrics: PlayerBiometrics = {
    height: typeof infoMap.get("height") === "string" ? String(infoMap.get("height")) : null,
    age: infoMap.get("age") ? parseInt(String(infoMap.get("age")), 10) : null,
    birthDate: data.birthDate?.utcTime?.slice(0, 10) ?? null,
    preferredFoot,
    country: typeof infoMap.get("country") === "string" ? translateCountryName(String(infoMap.get("country"))) : null,
    countryCode,
    marketValue: typeof infoMap.get("market value") === "string" ? String(infoMap.get("market value")) : null,
    contractEnd: contractYear ? `Hasta ${contractYear}` : null,
  };

  // Filtra partidos estrictamente a la temporada actual (2026/27, iniciada en agosto 2026)
  const currentSeasonRaw = (data.recentMatches ?? []).filter((m) => {
    const d = m.matchDate?.utcTime;
    return Boolean(d && d >= "2026-08-01");
  });

  const posCounts = new Map<string, number>();
  for (const m of currentSeasonRaw) {
    if (m.playedInMatch && m.lineupPositionId) {
      const k = String(m.lineupPositionId);
      posCounts.set(k, (posCounts.get(k) ?? 0) + 1);
    }
  }

  const primaryRaw = data.positionDescription?.primaryPosition?.label || "Jugador";
  const primaryTrans = translatePosition(primaryRaw);
  const rawPositions = data.positionDescription?.positions ?? [];

  const allPositions: PlayerPitchPosition[] = rawPositions.map((p) => {
    const trans = translatePosition(p.strPos?.label || "");
    const right = p.pitchPositionData?.right;
    const top = p.pitchPositionData?.top;
    let pitchCoordinates: { xPercent: number; yPercent: number } | null = null;
    if (right !== undefined && top !== undefined) {
      pitchCoordinates = { xPercent: Math.round(right * 100), yPercent: Math.round(top * 100) };
    } else {
      const norm = (p.strPos?.label || "").toLowerCase();
      const matchKey = Object.keys(DEFAULT_COORDS).find((k) => norm.includes(k));
      if (matchKey && DEFAULT_COORDS[matchKey]) {
        pitchCoordinates = { xPercent: DEFAULT_COORDS[matchKey].x, yPercent: DEFAULT_COORDS[matchKey].y };
      }
    }

    const occurrences = p.position ? (posCounts.get(p.position) ?? 0) : 0;

    return {
      label: trans.label,
      shortLabel: trans.short || p.strPosShort?.label || "JUG",
      occurrences,
      isMain: Boolean(p.isMainPosition),
      pitchCoordinates,
    };
  });

  if (allPositions.length === 0 && primaryRaw !== "Jugador") {
    const norm = primaryRaw.toLowerCase();
    const matchKey = Object.keys(DEFAULT_COORDS).find((k) => norm.includes(k));
    const coords = matchKey ? DEFAULT_COORDS[matchKey] : { x: 50, y: 50 };
    allPositions.push({
      label: primaryTrans.label,
      shortLabel: primaryTrans.short || "JUG",
      occurrences: 0,
      isMain: true,
      pitchCoordinates: { xPercent: coords.x, yPercent: coords.y },
    });
  }

  const positions: PlayerPositionsData = {
    primaryPosition: primaryTrans.label,
    primaryPositionShort: primaryTrans.short,
    allPositions,
  };

  const heatmap = (data.firstSeasonStats?.heatmap?.coordinates ?? []).map((c) => ({
    x: Math.round(c.x * 10) / 10,
    y: Math.round(c.y * 10) / 10,
  }));

  const statsGroups: PlayerProfileStatGroup[] = (data.firstSeasonStats?.statsSection?.items ?? [])
    .map((grp) => ({
      title: translatePlayerStatGroupTitle(grp.title),
      items: (grp.items ?? []).map((it) => {
        const title = translatePlayerStatTitle(it.title);
        const isPercentage = title.includes("(%)") || (it.title ?? "").includes("%");
        const rawValue = String(it.statValue ?? "0");
        const statValue = isPercentage && !rawValue.endsWith("%") ? `${rawValue}%` : rawValue;

        return {
          title,
          statValue,
          // Percentages are time-invariant ratios; normalizing them per 90 minutes is meaningless.
          per90: isPercentage ? 0 : Math.round((it.per90 ?? 0) * 100) / 100,
          percentileRank: it.percentileRank !== undefined ? Math.round(it.percentileRank) : undefined,
        };
      }),
    }))
    .filter((g) => g.items.length > 0);

  const shirtNumber = infoMap.get("shirt") ? parseInt(String(infoMap.get("shirt")), 10) : null;
  const recentMatches: PlayerSeasonMatchLog[] = currentSeasonRaw.map((m) => {
    const isHome = Boolean(m.isHomeTeam);
    const homeScore = m.homeScore ?? 0, awayScore = m.awayScore ?? 0;
    const teamScore = isHome ? homeScore : awayScore, oppScore = isHome ? awayScore : homeScore;
    const result = teamScore > oppScore ? "W" : teamScore === oppScore ? "D" : "L";
    const ratingNum = m.ratingProps?.rating ? parseFloat(m.ratingProps.rating) : null;

    return {
      matchId: m.id, date: m.matchDate?.utcTime ?? "", opponentName: m.opponentTeamName ?? "Rival",
      opponentTeamId: m.opponentTeamId ?? 0, isHome, homeScore, awayScore, result,
      minutesPlayed: m.minutesPlayed ?? 0, goals: m.goals ?? 0, assists: m.assists ?? 0,
      yellowCards: m.yellowCards ?? 0, redCards: m.redCards ?? 0,
      rating: ratingNum !== null && !Number.isNaN(ratingNum) ? ratingNum : null,
      isTopRating: Boolean(m.ratingProps?.isTopRating), onBench: Boolean(m.onBench),
      playedInMatch: Boolean(m.playedInMatch),
    };
  });

  return { fotmobId: data.id, name: data.name, shirtNumber, biometrics, positions, heatmap, statsGroups, recentMatches };
}
