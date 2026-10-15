import type { DomainPlayerMatchStats } from "./types.ts";
import { normalizeAthleteName } from "./types.ts";

export interface FotMobRawPlayerStatItem {
  readonly id: number;
  readonly name: string;
  readonly shirtNumber?: string;
  readonly teamId?: number;
  readonly isGoalkeeper?: boolean;
  readonly stats?: ReadonlyArray<{
    readonly title?: string;
    readonly key?: string;
    readonly stats?: Record<string, {
      readonly key?: string;
      readonly stat?: {
        readonly value?: number | null;
        readonly total?: number | null;
      };
    }>;
  }>;
}

const FOTMOB_SPORTING_ID = 9869;

/**
 * Parses raw FotMob player stats dictionary into strongly typed DomainPlayerMatchStats,
 * indexed by normalized athlete name, FotMob ID, and shirt number.
 *
 * @param raw Raw playerStats record from FotMob matchDetails endpoint.
 * @returns Map of DomainPlayerMatchStats keyed by canonical lookup keys.
 */
export function parseFotMobPlayerStats(
  raw: Record<string, FotMobRawPlayerStatItem> | undefined
): Record<string, DomainPlayerMatchStats> {
  const result: Record<string, DomainPlayerMatchStats> = {};
  if (!raw) return result;

  for (const item of Object.values(raw)) {
    if (!item || !item.name) continue;

    const statMap: Record<string, { value?: number | null; total?: number | null }> = {};
    for (const group of item.stats ?? []) {
      for (const [k, v] of Object.entries(group.stats ?? {})) {
        if (v?.stat) statMap[k.toLowerCase()] = v.stat;
      }
    }

    const getVal = (name: string, fallback = 0): number => {
      const entry = statMap[name.toLowerCase()];
      return typeof entry?.value === "number" ? entry.value : fallback;
    };

    const getTot = (name: string, fallback = 0): number => {
      const entry = statMap[name.toLowerCase()];
      return typeof entry?.total === "number" ? entry.total : fallback;
    };

    const getNullable = (name: string): number | null => {
      const entry = statMap[name.toLowerCase()];
      return typeof entry?.value === "number" ? Math.round(entry.value * 100) / 100 : null;
    };

    const isGk = Boolean(item.isGoalkeeper);
    const parsed: DomainPlayerMatchStats = {
      id: item.id,
      name: item.name,
      shirtNumber: item.shirtNumber,
      isGoalkeeper: isGk,
      rating: getNullable("fotmob rating"),
      minutesPlayed: getVal("minutes played", 90),
      goals: getVal("goals"),
      assists: getVal("assists"),
      expectedGoals: getNullable("expected goals (xg)"),
      expectedGoalsOnTarget: getNullable("expected goals on target (xgot)"),
      chancesCreated: getVal("chances created"),
      totalShots: getVal("total shots"),
      shotsOnTarget: getVal("shots on target"),
      touchesInBox: getVal("touches in opposition box"),
      passesFinalThird: getVal("passes into final third"),
      touches: getVal("touches"),
      dispossessed: getVal("dispossessed"),
      accuratePasses: getVal("accurate passes"),
      totalPasses: getTot("accurate passes") || getVal("accurate passes"),
      accurateLongBalls: getVal("accurate long balls"),
      totalLongBalls: getTot("accurate long balls") || getVal("accurate long balls"),
      defensiveActions: getVal("defensive actions"),
      tacklesWon: getVal("tackles"),
      interceptions: getVal("interceptions"),
      recoveries: getVal("recoveries"),
      clearances: getVal("clearances"),
      blocks: getVal("blocks"),
      dribbledPast: getVal("dribbled past"),
      duelsWon: getVal("duels won"),
      duelsLost: getVal("duels lost"),
      groundDuelsWon: getVal("ground duels won"),
      totalGroundDuels: getTot("ground duels won") || getVal("ground duels won"),
      aerialDuelsWon: getVal("aerial duels won"),
      totalAerialDuels: getTot("aerial duels won") || getVal("aerial duels won"),
      wasFouled: getVal("was fouled"),
      foulsCommitted: getVal("fouls committed"),
      saves: isGk ? getVal("saves") : undefined,
      savesInsideBox: isGk ? getVal("saves inside box") : undefined,
      goalsConceded: isGk ? getVal("goals conceded") : undefined,
      xgotFaced: isGk ? getNullable("xgot faced") : undefined,
      goalsPrevented: isGk ? getNullable("goals prevented") : undefined,
      highClaims: isGk ? getVal("high claim") : undefined,
      punches: isGk ? getVal("punches") : undefined,
    };

    const norm = normalizeAthleteName({ displayName: item.name }).name.toLowerCase();
    result[norm] = parsed;
    result[String(item.id)] = parsed;
    if (item.shirtNumber) {
      if (item.teamId) {
        result[`${item.teamId}_${item.shirtNumber}`] = parsed;
      }
      if (item.teamId === FOTMOB_SPORTING_ID || !item.teamId) {
        result[`jersey_${item.shirtNumber}`] = parsed;
      }
    }
  }

  return result;
}

export interface FotMobGoalEventItem {
  readonly timeStr?: number | string;
  readonly nameStr?: string;
  readonly assistStr?: string | null;
  readonly player?: { readonly name?: string };
}

export interface FotMobGoalFacts {
  readonly events?: {
    readonly events?: {
      readonly homeTeamGoals?: Record<string, readonly FotMobGoalEventItem[]>;
      readonly awayTeamGoals?: Record<string, readonly FotMobGoalEventItem[]>;
    };
  };
  readonly homeTeamGoals?: Record<string, readonly FotMobGoalEventItem[]>;
  readonly awayTeamGoals?: Record<string, readonly FotMobGoalEventItem[]>;
}

export function parseFotMobGoalAssists(
  facts?: FotMobGoalFacts
): ReadonlyArray<{ readonly minute: number; readonly scorerName: string; readonly assistantName: string }> {
  const goalMap = facts?.events?.events ?? facts;
  const rawGoals = [
    ...Object.values(goalMap?.homeTeamGoals ?? {}),
    ...Object.values(goalMap?.awayTeamGoals ?? {}),
  ].flat();

  return rawGoals
    .filter((g): g is FotMobGoalEventItem & { assistStr: string } => Boolean(g && g.assistStr))
    .map((g) => ({
      minute: typeof g.timeStr === "number" ? g.timeStr : parseInt(String(g.timeStr), 10) || 0,
      scorerName: g.nameStr || g.player?.name || "",
      assistantName: g.assistStr.replace(/assist by /i, "").trim(),
    }));
}
