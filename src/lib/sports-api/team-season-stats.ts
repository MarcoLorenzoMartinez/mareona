import type { TeamSeasonStats, TeamSeasonStatsSplit } from "./team-season-types.ts";
import { getCurrentSeasonYear } from "./types.ts";

const FOTMOB_SPORTING_ID = 9869;
const FOTMOB_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
};

/** In-memory cache for fast tab navigation */
let memoryCachedTeamStats: {
  data: TeamSeasonStats;
  expiresAt: number;
} | null = null;

const TTL_TEAM_STATS_MS = 10 * 60 * 1000; // 10 minutes

interface RawStatItem {
  readonly header?: string;
  readonly participant?: {
    readonly value?: number;
    readonly rank?: number;
    readonly stat?: { readonly name?: string; readonly value?: number; readonly format?: string };
  };
}

interface RawSplitRow {
  readonly id?: number;
  readonly played?: number;
  readonly wins?: number;
  readonly draws?: number;
  readonly losses?: number;
  readonly scoresStr?: string;
  readonly pts?: number;
  readonly idx?: number;
}

interface RawFotMobTeamPayload {
  readonly stats?: {
    readonly teams?: readonly RawStatItem[];
  };
  readonly table?: ReadonlyArray<{
    readonly data?: {
      readonly table?: {
        readonly all?: readonly RawSplitRow[];
        readonly home?: readonly RawSplitRow[];
        readonly away?: readonly RawSplitRow[];
      };
    };
  }>;
}

function parseSplit(row?: RawSplitRow): TeamSeasonStatsSplit {
  const scores = (row?.scoresStr ?? "0-0").split("-");
  const goalsFor = parseInt(scores[0] ?? "0", 10) || 0;
  const goalsAgainst = parseInt(scores[1] ?? "0", 10) || 0;

  return {
    played: row?.played ?? 0,
    wins: row?.wins ?? 0,
    draws: row?.draws ?? 0,
    losses: row?.losses ?? 0,
    goalsFor,
    goalsAgainst,
    points: row?.pts ?? 0,
    rank: row?.idx ?? 0,
  };
}

/**
 * Transforms FotMob team metrics payload into a clean Domain TeamSeasonStats model.
 *
 * @param payload Raw FotMob team details payload
 * @returns Clean TeamSeasonStats or null if unparseable
 */
export function transformFotMobTeamStats(payload: RawFotMobTeamPayload): TeamSeasonStats | null {
  const teamsStats = payload.stats?.teams ?? [];
  if (teamsStats.length === 0) return null;

  const statMap = new Map<string, { val: number; rank: number | null }>();
  for (const s of teamsStats) {
    const key = s.participant?.stat?.name || s.header?.toLowerCase().trim() || "";
    const val = s.participant?.value ?? s.participant?.stat?.value ?? 0;
    const rank = s.participant?.rank ?? null;
    statMap.set(key, { val, rank });
  }

  const getMetric = (key: string): { val: number; rank: number | null } => {
    return statMap.get(key) ?? { val: 0, rank: null };
  };

  const tableData = payload.table?.[0]?.data?.table;
  const sportingHome = tableData?.home?.find((r) => r.id === FOTMOB_SPORTING_ID);
  const sportingAway = tableData?.away?.find((r) => r.id === FOTMOB_SPORTING_ID);
  const sportingAll = tableData?.all?.find((r) => r.id === FOTMOB_SPORTING_ID);

  return {
    seasonYear: getCurrentSeasonYear(),
    competition: "LaLiga Hypermotion",
    matchesPlayed: sportingAll?.played ?? 0,
    rating: getMetric("rating_team").val || 6.8,
    ratingRank: getMetric("rating_team").rank,
    // Attack
    goalsPerMatch: getMetric("goals_team_match").val,
    goalsPerMatchRank: getMetric("goals_team_match").rank,
    expectedGoals: getMetric("expected_goals_team").val,
    expectedGoalsRank: getMetric("expected_goals_team").rank,
    shotsOnTargetPerMatch: getMetric("ontarget_scoring_att_team").val,
    shotsOnTargetRank: getMetric("ontarget_scoring_att_team").rank,
    bigChances: getMetric("big_chance_team").val,
    bigChancesRank: getMetric("big_chance_team").rank,
    touchesInOppBox: getMetric("touches_in_opp_box_team").val,
    touchesInOppBoxRank: getMetric("touches_in_opp_box_team").rank,
    setPieceGoals: getMetric("_set_piece_goals_team").val,
    cornersTaken: getMetric("corner_taken_team").val,
    // Possession & Play
    averagePossession: getMetric("possession_percentage_team").val,
    possessionRank: getMetric("possession_percentage_team").rank,
    accuratePassesPerMatch: getMetric("accurate_pass_team").val,
    accuratePassesRank: getMetric("accurate_pass_team").rank,
    accurateLongBallsPerMatch: getMetric("accurate_long_balls_team").val,
    accurateCrossesPerMatch: getMetric("accurate_cross_team").val,
    accurateCrossesRank: getMetric("accurate_cross_team").rank,
    // Defense
    goalsConcededPerMatch: getMetric("goals_conceded_team_match").val,
    goalsConcededRank: getMetric("goals_conceded_team_match").rank,
    expectedGoalsConceded: getMetric("expected_goals_conceded_team").val,
    xGConcededRank: getMetric("expected_goals_conceded_team").rank,
    cleanSheets: getMetric("clean_sheet_team").val,
    cleanSheetsRank: getMetric("clean_sheet_team").rank,
    interceptionsPerMatch: getMetric("interception_team").val,
    interceptionsRank: getMetric("interception_team").rank,
    tacklesPerMatch: getMetric("total_tackle_team").val,
    clearancesPerMatch: getMetric("effective_clearance_team").val,
    possessionWonAttackingThirdPerMatch: getMetric("poss_won_att_3rd_team").val,
    savesPerMatch: getMetric("saves_team").val,
    // Stadium & Discipline
    homeAttendance: getMetric("home_attendance_team").val,
    attendanceRank: getMetric("home_attendance_team").rank,
    yellowCards: getMetric("total_yel_card_team").val,
    redCards: getMetric("total_red_card_team").val,
    foulsPerMatch: getMetric("fk_foul_lost_team").val,
    // Splits
    homeSplit: parseSplit(sportingHome),
    awaySplit: parseSplit(sportingAway),
  };
}

/**
 * Fetches collective season statistics for Real Sporting from live sports API.
 * Uses in-memory caching to guarantee instant navigation.
 *
 * @returns TeamSeasonStats or null if unavailable
 */
export async function fetchTeamSeasonStats(): Promise<TeamSeasonStats | null> {
  const now = Date.now();
  if (memoryCachedTeamStats && memoryCachedTeamStats.expiresAt > now) {
    return memoryCachedTeamStats.data;
  }

  try {
    const res = await fetch(`https://www.fotmob.com/api/data/teams?id=${FOTMOB_SPORTING_ID}`, {
      headers: FOTMOB_HEADERS,
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as RawFotMobTeamPayload;
    const stats = transformFotMobTeamStats(json);

    if (stats) {
      memoryCachedTeamStats = {
        data: stats,
        expiresAt: now + TTL_TEAM_STATS_MS,
      };
      return stats;
    }
  } catch {
    // Return null transparently without fake data
  }

  return null;
}
