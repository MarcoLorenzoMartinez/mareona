import { normalizeAthleteName, type DomainAdvancedStats, type DomainShotItem } from "./types.ts";
import {
  parseFotMobPlayerStats, parseFotMobGoalAssists,
  type FotMobRawPlayerStatItem, type FotMobGoalFacts,
} from "./fotmob-player-parser.ts";

const FOTMOB_SPORTING_ID = 9869;
const FOTMOB_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" };

interface FotMobRawShot {
  readonly id: number; readonly eventType: string; readonly isGoal?: boolean;
  readonly isOnTarget?: boolean; readonly isBlocked?: boolean; readonly teamId: number;
  readonly playerId: number; readonly playerName: string; readonly min: number;
  readonly x: number; readonly y: number; readonly expectedGoals?: number;
  readonly expectedGoalsOnTarget?: number | null;
  readonly onGoalShot?: { readonly x: number; readonly y: number } | null;
  readonly goalCrossedZ?: number | null; readonly shotType?: string; readonly situation?: string;
}

interface FotMobRawPayload {
  readonly general?: { readonly homeTeam?: { readonly id: number }; readonly awayTeam?: { readonly id: number } };
  readonly header?: { readonly events?: FotMobGoalFacts };
  readonly content?: {
    readonly matchFacts?: FotMobGoalFacts;
    readonly stats?: { readonly Periods?: { readonly All?: { readonly stats?: ReadonlyArray<{ readonly stats?: ReadonlyArray<{ readonly title?: string; readonly stats?: ReadonlyArray<string | number | null> }> }> } } };
    readonly shotmap?: { readonly shots?: readonly FotMobRawShot[] };
    readonly attackingZones?: {
      readonly home?: { readonly total?: { readonly left: number; readonly center: number; readonly right: number } };
      readonly away?: { readonly total?: { readonly left: number; readonly center: number; readonly right: number } };
    };
    readonly momentum?: { readonly main?: { readonly data?: ReadonlyArray<{ readonly minute: number; readonly value: number }> } };
    readonly playerStats?: Record<string, FotMobRawPlayerStatItem>;
  };
}

export function transformFotMobAdvancedStats(
  data: FotMobRawPayload,
  homeTeamId: number,
  awayTeamId: number
): DomainAdvancedStats {
  const content = data.content;
  const rawShots = content?.shotmap?.shots ?? [];

  const shots: DomainShotItem[] = rawShots.map((s) => {
    const isHome = s.teamId === homeTeamId;
    const isSporting = s.teamId === FOTMOB_SPORTING_ID;
    const norm = normalizeAthleteName({ id: String(s.playerId), displayName: s.playerName });
    const isGoal = s.eventType === "Goal" || Boolean(s.isGoal);

    return {
      id: s.id,
      eventType: isGoal ? "Goal" : s.eventType === "AttemptSaved" ? "AttemptSaved" : s.isBlocked ? "Blocked" : "Miss",
      isGoal,
      isOnTarget: Boolean(s.isOnTarget),
      isBlocked: Boolean(s.isBlocked),
      isHome,
      isSporting,
      teamId: String(s.teamId),
      playerId: String(s.playerId),
      playerName: norm.name,
      minute: s.min,
      x: Math.round(s.x * 10) / 10,
      y: Math.round(s.y * 10) / 10,
      expectedGoals: Math.round((s.expectedGoals ?? 0) * 1000) / 1000,
      expectedGoalsOnTarget:
        s.expectedGoalsOnTarget !== null && s.expectedGoalsOnTarget !== undefined
          ? Math.round(s.expectedGoalsOnTarget * 1000) / 1000
          : null,
      onGoalShot: s.onGoalShot ? { x: s.onGoalShot.x, y: s.onGoalShot.y } : null,
      goalCrossedZ: s.goalCrossedZ ?? null,
      shotType: s.shotType || "Normal",
      situation: s.situation || "RegularPlay",
    };
  });

  const allStatItems: Array<{ title?: string; stats?: ReadonlyArray<string | number | null> }> = [];
  for (const block of content?.stats?.Periods?.All?.stats ?? []) {
    for (const item of block.stats ?? []) {
      if (item.title) allStatItems.push(item);
    }
  }

  const findStat = (name: string): [number, number] => {
    const match = allStatItems.find((i) => i.title?.toLowerCase().includes(name.toLowerCase()));
    if (!match || !match.stats) return [0, 0];
    const h = parseFloat(String(match.stats[0] ?? "0"));
    const a = parseFloat(String(match.stats[1] ?? "0"));
    return [Number.isNaN(h) ? 0 : h, Number.isNaN(a) ? 0 : a];
  };

  const findStatRaw = (name: string): [string | number, string | number] => {
    const match = allStatItems.find((i) => i.title?.toLowerCase().includes(name.toLowerCase()));
    if (!match || !match.stats) return [0, 0];
    return [match.stats[0] ?? 0, match.stats[1] ?? 0];
  };

  const [homeXgFromStat, awayXgFromStat] = findStat("Expected goals");
  const homeXg = homeXgFromStat > 0 ? homeXgFromStat : shots.filter((s) => s.isHome).reduce((acc, s) => acc + s.expectedGoals, 0);
  const awayXg = awayXgFromStat > 0 ? awayXgFromStat : shots.filter((s) => !s.isHome).reduce((acc, s) => acc + s.expectedGoals, 0);
  const [homeXgOpenPlay, awayXgOpenPlay] = findStat("xG open play");
  const [homeXgSetPlay, awayXgSetPlay] = findStat("xG set play");
  const [homeXgot, awayXgot] = findStat("xG on target");
  const [homeShotsInsideBox, awayShotsInsideBox] = findStat("Shots inside box");
  const [homeShotsOutsideBox, awayShotsOutsideBox] = findStat("Shots outside box");
  const [homePassesOwnHalf, awayPassesOwnHalf] = findStat("Own half");
  const [homePassesOppHalf, awayPassesOppHalf] = findStat("Opposition half");
  const [homeGroundDuelsWon, awayGroundDuelsWon] = findStatRaw("Ground duels won");
  const [homeAerialDuelsWon, awayAerialDuelsWon] = findStatRaw("Aerial duels won");
  const [homeDribblesWon, awayDribblesWon] = findStatRaw("Successful dribbles");

  const az = content?.attackingZones;
  const attackingZones =
    az?.home?.total && az?.away?.total ? { home: az.home.total, away: az.away.total } : undefined;

  return {
    homeXg: Math.round(homeXg * 100) / 100, awayXg: Math.round(awayXg * 100) / 100,
    homeXgOpenPlay, awayXgOpenPlay, homeXgSetPlay, awayXgSetPlay, homeXgot, awayXgot,
    homeBigChances: findStat("Big chances")[0], awayBigChances: findStat("Big chances")[1],
    homeBigChancesMissed: findStat("Big chances missed")[0], awayBigChancesMissed: findStat("Big chances missed")[1],
    homeBoxTouches: findStat("Touches in opposition")[0], awayBoxTouches: findStat("Touches in opposition")[1],
    homeShotsInsideBox, awayShotsInsideBox, homeShotsOutsideBox, awayShotsOutsideBox,
    homePassesOwnHalf, awayPassesOwnHalf, homePassesOppHalf, awayPassesOppHalf,
    homeDuelsWon: findStat("Duels won")[0], awayDuelsWon: findStat("Duels won")[1],
    homeGroundDuelsWon, awayGroundDuelsWon, homeAerialDuelsWon, awayAerialDuelsWon,
    homeDribblesWon, awayDribblesWon, attackingZones,
    momentum: content?.momentum?.main?.data, shots,
    playerStats: parseFotMobPlayerStats(content?.playerStats),
    goalAssists: parseFotMobGoalAssists(data.header?.events ?? content?.matchFacts),
  };
}

export async function fetchFotMobAdvancedStats(
  kickoffAt: string,
  homeTeamName: string,
  awayTeamName: string
): Promise<DomainAdvancedStats | null> {
  try {
    const teamRes = await fetch(`https://www.fotmob.com/api/data/teams?id=${FOTMOB_SPORTING_ID}`, {
      headers: FOTMOB_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!teamRes.ok) return null;

    type FixtureItem = { id: number; home?: { id: number; name?: string }; away?: { id: number; name?: string }; status?: { utcTime?: string } };
    const teamData = (await teamRes.json()) as { fixtures?: { allFixtures?: { fixtures?: ReadonlyArray<FixtureItem> } } };

    const targetDate = kickoffAt.slice(0, 10);
    const fixtures = teamData.fixtures?.allFixtures?.fixtures ?? [];
    const match = fixtures.find((f) => {
      const fDate = f.status?.utcTime?.slice(0, 10);
      if (fDate === targetDate) return true;
      const hName = (f.home?.name ?? "").toLowerCase();
      const aName = (f.away?.name ?? "").toLowerCase();
      const targetHome = homeTeamName.toLowerCase();
      const targetAway = awayTeamName.toLowerCase();
      return (
        (targetHome.includes(hName) || hName.includes(targetHome)) &&
        (targetAway.includes(aName) || aName.includes(targetAway))
      );
    });

    if (!match) return null;

    const detailRes = await fetch(`https://www.fotmob.com/api/data/matchDetails?matchId=${match.id}`, {
      headers: FOTMOB_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!detailRes.ok) return null;

    const detailData = (await detailRes.json()) as FotMobRawPayload;
    const homeId = detailData.general?.homeTeam?.id ?? match.home?.id ?? 0;
    const awayId = detailData.general?.awayTeam?.id ?? match.away?.id ?? 0;

    return transformFotMobAdvancedStats(detailData, homeId, awayId);
  } catch {
    return null;
  }
}
