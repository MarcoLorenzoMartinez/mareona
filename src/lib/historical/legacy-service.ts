import rawSquads from "../../data/historical/squads.json" with { type: "json" };
import legendsData from "../../data/historical/legends.json" with { type: "json" };
import type {
  IndividualAward,
  LegacyCoachRecord,
  LegacyPlayerRecord,
  LegendProfile,
} from "./legacy-types";


interface RawPlayer {
  readonly alias?: string;
  readonly name?: string;
  readonly fullName?: string;
  readonly position?: string;
  readonly played?: number;
  readonly goals?: number;
  readonly minutes?: number;
  readonly photoUrl?: string | null;
}


/**
 * Computes all-time player rankings by appearances (matches played).
 */
export function getTopAppearancesPlayers(limit = 20): LegacyPlayerRecord[] {
  const aggregated = aggregateAllPlayers();
  aggregated.sort((a, b) => b.totalPlayed - a.totalPlayed);

  return aggregated.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Computes all-time player rankings by goals scored.
 */
export function getTopScorersPlayers(limit = 20): LegacyPlayerRecord[] {
  const aggregated = aggregateAllPlayers();
  aggregated.sort((a, b) => b.totalGoals - a.totalGoals);

  return aggregated.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Computes all-time player rankings by number of seasons in the first team.
 */
export function getTopSeasonsPlayers(limit = 20): LegacyPlayerRecord[] {
  const aggregated = aggregateAllPlayers();
  aggregated.sort((a, b) => b.seasonCount - a.seasonCount);

  return aggregated.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Returns all verified individual awards (Pichichis, Zamoras).
 */
export function getIndividualAwards(): IndividualAward[] {
  return legendsData.awards as unknown as IndividualAward[];
}

/**
 * Returns verified legendary profiles for the Legends Wall.
 */
export function getLegendProfiles(): LegendProfile[] {
  return legendsData.legends as unknown as LegendProfile[];
}

interface RawCoach {
  readonly alias?: string;
  readonly fullName?: string;
  readonly matches?: number;
  readonly won?: number;
  readonly drawn?: number;
  readonly lost?: number;
  readonly photoUrl?: string | null;
}

interface RawSeasonSquad {
  readonly coaches?: readonly RawCoach[];
}

/**
 * Computes all-time coaches ranking by official matches directed.
 */
export function getTopCoaches(limit = 20): LegacyCoachRecord[] {
  const coachMap = new Map<
    string,
    {
      name: string;
      fullName: string;
      matches: number;
      won: number;
      drawn: number;
      lost: number;
      seasons: string[];
      photoUrl: string | null;
    }
  >();

  const squadsRecord = rawSquads as unknown as Record<string, RawSeasonSquad>;

  for (const [seasonId, seasonData] of Object.entries(squadsRecord)) {
    if (!seasonData.coaches) continue;
    for (const c of seasonData.coaches) {
      const key = c.fullName || c.alias;
      if (!key) continue;

      const existing = coachMap.get(key) ?? {
        name: c.alias || key,
        fullName: c.fullName || c.alias || key,
        matches: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        seasons: [],
        photoUrl: c.photoUrl ?? null,
      };

      existing.matches += c.matches || 0;
      existing.won += c.won || 0;
      existing.drawn += c.drawn || 0;
      existing.lost += c.lost || 0;
      existing.seasons.push(seasonId);
      if (!existing.photoUrl && c.photoUrl) {
        existing.photoUrl = c.photoUrl;
      }

      coachMap.set(key, existing);
    }
  }

  const sorted = Array.from(coachMap.values())
    .filter((c) => c.matches > 0)
    .sort((a, b) => b.matches - a.matches || b.won - a.won);

  return sorted.slice(0, limit).map((c, idx) => {
    const uniqueSeasons = Array.from(new Set(c.seasons)).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10),
    );

    return {
      rank: idx + 1,
      name: c.name,
      fullName: c.fullName,
      matches: c.matches,
      won: c.won,
      drawn: c.drawn,
      lost: c.lost,
      seasonsCount: uniqueSeasons.length,
      startSeason: uniqueSeasons[0] ?? "",
      endSeason: uniqueSeasons[uniqueSeasons.length - 1] ?? "",
      photoUrl: c.photoUrl,
    };
  });
}



/**
 * Helper: aggregates 900+ players from squads.json.
 */
function aggregateAllPlayers(): Omit<LegacyPlayerRecord, "rank">[] {
  const playerMap = new Map<string, {
    name: string;
    fullName: string;
    position: string;
    photoUrl: string | null;
    totalPlayed: number;
    totalGoals: number;
    totalMinutes: number;
    seasons: Set<string>;
  }>();

  const squadsRecord = rawSquads as unknown as Record<string, { players?: readonly RawPlayer[] } | readonly RawPlayer[]>;

  for (const [season, squad] of Object.entries(squadsRecord)) {
    const list = Array.isArray(squad)
      ? squad
      : "players" in squad && Array.isArray(squad.players)
      ? squad.players
      : [];
    if (!Array.isArray(list) || list.length === 0) continue;

    for (const p of list) {
      const alias = p.alias || p.name || p.fullName;
      if (!alias) continue;

      // Unique player key
      const key = (p.fullName || alias).toLowerCase();

      const existing = playerMap.get(key) ?? {
        name: alias,
        fullName: p.fullName || alias,
        position: p.position || "Jugador",
        photoUrl: p.photoUrl || null,
        totalPlayed: 0,
        totalGoals: 0,
        totalMinutes: 0,
        seasons: new Set<string>(),
      };

      existing.totalPlayed += p.played || 0;
      existing.totalGoals += p.goals || 0;
      existing.totalMinutes += p.minutes || 0;
      existing.seasons.add(season);

      if (p.photoUrl && !existing.photoUrl) existing.photoUrl = p.photoUrl;
      if (p.position && existing.position === "Jugador") existing.position = p.position;

      playerMap.set(key, existing);
    }
  }

  return Array.from(playerMap.values()).map((p) => {
    const seasonsList = Array.from(p.seasons).sort((a, b) => a.localeCompare(b));
    return {
      name: p.name,
      fullName: p.fullName,
      position: p.position,
      photoUrl: p.photoUrl,
      totalPlayed: p.totalPlayed,
      totalGoals: p.totalGoals,
      totalMinutes: p.totalMinutes,
      seasonCount: p.seasons.size,
      startSeason: seasonsList[0] ?? "",
      endSeason: seasonsList[seasonsList.length - 1] ?? "",
      seasonsList,
    };
  });
}
