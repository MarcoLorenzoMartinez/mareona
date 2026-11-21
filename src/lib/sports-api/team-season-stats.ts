import type {
  TeamSeasonStats,
  TeamSeasonStatsSplit,
  TeamSeasonGoalItem,
} from "./team-season-types.ts";
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
let inFlightTeamStats: Promise<TeamSeasonStats | null> | null = null;
const TEAM_STATS_TTL_MS = 30 * 60 * 1000;

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

interface RawXgRow {
  readonly id?: number;
  readonly pts?: number;
  readonly xPoints?: number;
  readonly xPointsDiff?: number;
  readonly xPosition?: number;
}

interface RawFixtureItem {
  readonly id?: number;
  readonly status?: { readonly finished?: boolean };
  readonly tournament?: { readonly name?: string };
  readonly home?: { readonly id?: number; readonly name?: string; readonly score?: number };
  readonly away?: { readonly id?: number; readonly name?: string; readonly score?: number };
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
        readonly xg?: readonly RawXgRow[];
      };
    };
  }>;
  readonly fixtures?: {
    readonly allFixtures?: {
      readonly fixtures?: readonly RawFixtureItem[];
    };
  };
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
export function transformFotMobTeamStats(
  payload: RawFotMobTeamPayload,
  seasonGoals: readonly TeamSeasonGoalItem[] = [],
  tacticalSpatial?: {
    attackingZones?: { left: number; center: number; right: number };
    passTerritory?: { ownHalfPasses: number; oppHalfPasses: number; ownHalfPct: number; oppHalfPct: number };
    heatmapCirclesSvg?: string;
  }
): TeamSeasonStats | null {
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
  const sportingXg = tableData?.xg?.find((r) => r.id === FOTMOB_SPORTING_ID);

  // Calculate league match patterns
  const leagueFixtures = (payload.fixtures?.allFixtures?.fixtures ?? []).filter(
    (f) => f.status?.finished && (f.tournament?.name?.includes("LaLiga") ?? true)
  );

  let cleanSheetsCount = 0;
  let withoutScoringCount = 0;
  let bothTeamsScoredCount = 0;
  let highScoringMatchesCount = 0;
  let tightMatchesCount = 0;

  for (const f of leagueFixtures) {
    const isHome = f.home?.id === FOTMOB_SPORTING_ID;
    const gf = isHome ? f.home?.score : f.away?.score;
    const ga = isHome ? f.away?.score : f.home?.score;
    if (gf === undefined || ga === undefined) continue;

    if (ga === 0) cleanSheetsCount++;
    if (gf === 0) withoutScoringCount++;
    if (gf > 0 && ga > 0) bothTeamsScoredCount++;
    if (gf + ga >= 3) highScoringMatchesCount++;
    else tightMatchesCount++;
  }

  return {
    seasonYear: getCurrentSeasonYear(),
    competition: "LaLiga Hypermotion",
    matchesPlayed: sportingAll?.played ?? 0,
    rating: getMetric("rating_team").val || 0,
    ratingRank: getMetric("rating_team").rank,
    seasonGoals,
    // Efficiency & Expected Points
    actualPoints: sportingXg?.pts ?? sportingAll?.pts ?? 0,
    actualStandingsRank: sportingAll?.idx ?? null,
    expectedPoints: sportingXg?.xPoints ?? 0,
    expectedPointsDiff: sportingXg?.xPointsDiff ?? 0,
    expectedStandingsRank: sportingXg?.xPosition ?? null,
    patterns: {
      cleanSheetsCount,
      withoutScoringCount,
      bothTeamsScoredCount,
      highScoringMatchesCount,
      tightMatchesCount,
    },
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
    setPieceGoalsRank: getMetric("_set_piece_goals_team").rank,
    cornersTaken: getMetric("corner_taken_team").val,
    cornersTakenRank: getMetric("corner_taken_team").rank,
    // Possession & Play
    averagePossession: getMetric("possession_percentage_team").val,
    possessionRank: getMetric("possession_percentage_team").rank,
    accuratePassesPerMatch: getMetric("accurate_pass_team").val,
    accuratePassesRank: getMetric("accurate_pass_team").rank,
    accurateLongBallsPerMatch: getMetric("accurate_long_balls_team").val,
    accurateLongBallsRank: getMetric("accurate_long_balls_team").rank,
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
    tacklesRank: getMetric("total_tackle_team").rank,
    clearancesPerMatch: getMetric("effective_clearance_team").val,
    clearancesRank: getMetric("effective_clearance_team").rank,
    setPieceGoalsConceded: getMetric("_set_piece_goals_conceded_team").val,
    setPieceGoalsConcededRank: getMetric("_set_piece_goals_conceded_team").rank,
    penaltiesConceded: getMetric("penalty_conceded_team").val,
    penaltiesConcededRank: getMetric("penalty_conceded_team").rank,
    possessionWonAttackingThirdPerMatch: getMetric("poss_won_att_3rd_team").val,
    savesPerMatch: getMetric("saves_team").val,
    savesRank: getMetric("saves_team").rank,
    // Stadium & Discipline
    homeAttendance: getMetric("home_attendance_team").val,
    attendanceRank: getMetric("home_attendance_team").rank,
    yellowCards: getMetric("total_yel_card_team").val,
    yellowCardsRank: getMetric("total_yel_card_team").rank,
    redCards: getMetric("total_red_card_team").val,
    redCardsRank: getMetric("total_red_card_team").rank,
    foulsPerMatch: getMetric("fk_foul_lost_team").val,
    foulsRank: getMetric("fk_foul_lost_team").rank,
    // Splits
    homeSplit: parseSplit(sportingHome),
    awaySplit: parseSplit(sportingAway),
    // Tactical Spatial
    attackingZones: tacticalSpatial?.attackingZones,
    passTerritory: tacticalSpatial?.passTerritory,
    heatmapCirclesSvg: tacticalSpatial?.heatmapCirclesSvg,
  };
}

/**
 * Fetches collective season statistics for Real Sporting from live sports API.
 * Uses in-memory caching to guarantee instant navigation.
 *
 * @returns TeamSeasonStats or null if unavailable
 */
export async function fetchTeamSeasonStats(): Promise<TeamSeasonStats | null> {
  if (memoryCachedTeamStats && Date.now() < memoryCachedTeamStats.expiresAt) {
    return memoryCachedTeamStats.data;
  }
  if (inFlightTeamStats) {
    return inFlightTeamStats;
  }

  inFlightTeamStats = (async () => {
    try {
      const res = await fetch(`https://www.fotmob.com/api/data/teams?id=${FOTMOB_SPORTING_ID}`, {
        headers: FOTMOB_HEADERS,
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;

      const json = (await res.json()) as RawFotMobTeamPayload;

      // Aggregate goals from up to 10 most recent finished matches to avoid request storms
      const finishedMatches = (json.fixtures?.allFixtures?.fixtures ?? [])
        .filter((f) => f.id && f.status?.finished)
        .slice(-10);

    const goalsPromises = finishedMatches.map(async (fixture) => {
      const matchId = fixture.id;
      if (!matchId) return { goals: [], attackingZones: null, passTerritory: null };
      const isHome = fixture.home?.id === FOTMOB_SPORTING_ID;
      const rivalName = (isHome ? fixture.away?.name : fixture.home?.name) || "Rival";
      const teamScore = isHome ? fixture.home?.score : fixture.away?.score;

      try {
        const matchRes = await fetch(
          `https://www.fotmob.com/api/data/matchDetails?matchId=${matchId}`,
          { headers: FOTMOB_HEADERS, next: { revalidate: 3600 } }
        );
        if (!matchRes.ok) return { goals: [], attackingZones: null, passTerritory: null };
        interface RawShotItem {
          readonly id?: number;
          readonly eventType?: string;
          readonly teamId?: number;
          readonly playerName?: string;
          readonly player?: { readonly name?: string };
          readonly min?: number;
          readonly x?: number;
          readonly y?: number;
          readonly expectedGoals?: number;
          readonly expectedGoalsOnTarget?: number;
          readonly shotType?: string;
          readonly situation?: string;
          readonly onGoalShot?: { readonly x?: number; readonly y?: number };
        }
        interface RawStatPeriodItem {
          readonly key?: string;
          readonly stats?: readonly (string | number | null)[];
        }
        interface RawStatGroupItem {
          readonly title?: string;
          readonly key?: string;
          readonly stats?: readonly RawStatPeriodItem[];
        }
        interface RawPlayerStatEntry {
          readonly teamId?: number;
          readonly optaId?: string | number;
        }
        const mData = (await matchRes.json()) as {
          content?: {
            heatmapUrl?: string;
            playerStats?: Record<string, RawPlayerStatEntry>;
            shotmap?: { shots?: readonly RawShotItem[] };
            attackingZones?: {
              home?: { total?: { left: number; center: number; right: number } };
              away?: { total?: { left: number; center: number; right: number } };
            };
            stats?: {
              Periods?: {
                All?: {
                  stats?: readonly RawStatGroupItem[];
                };
              };
            };
          };
        };

        const shots = mData.content?.shotmap?.shots ?? [];
        const matchGoals: TeamSeasonGoalItem[] = [];

        if (teamScore && teamScore > 0) {
          for (const s of shots) {
            if (s.eventType === "Goal" && s.teamId === FOTMOB_SPORTING_ID && s.x !== undefined && s.y !== undefined) {
              matchGoals.push({
                id: s.id ?? Math.floor(Math.random() * 100000),
                matchId,
                playerName: s.playerName || s.player?.name || "Real Sporting",
                rivalName,
                isHome,
                minute: s.min ?? 0,
                expectedGoals: s.expectedGoals ?? 0,
                expectedGoalsOnTarget: s.expectedGoalsOnTarget,
                shotType: s.shotType,
                situation: s.situation,
                x: s.x,
                y: s.y,
                onGoalX: s.onGoalShot?.x,
                onGoalY: s.onGoalShot?.y,
              });
            }
          }
        }

        // Tactical attacking zones for Sporting
        const az = mData.content?.attackingZones;
        const matchZones = isHome ? az?.home?.total : az?.away?.total;

        // Tactical pass territory for Sporting
        let ownHalf: number | null = null;
        let oppHalf: number | null = null;
        const statsList = mData.content?.stats?.Periods?.All?.stats ?? [];
        const passCat = statsList.find(
          (c) => (c.title || "").toLowerCase().includes("pass") || (c.key || "").toLowerCase().includes("pass")
        );
        if (passCat) {
          const ownHalfStat = passCat.stats?.find((s) => s.key === "own_half_passes")?.stats;
          const oppHalfStat = passCat.stats?.find((s) => s.key === "opposition_half_passes")?.stats;
          const teamIdx = isHome ? 0 : 1;
          if (ownHalfStat && ownHalfStat[teamIdx] !== undefined) ownHalf = Number(ownHalfStat[teamIdx]);
          if (oppHalfStat && oppHalfStat[teamIdx] !== undefined) oppHalf = Number(oppHalfStat[teamIdx]);
        }

        // Tactical heatmap circles from Opta/FotMob for Sporting
        let heatmapCircles = "";
        const heatmapPath = mData.content?.heatmapUrl;
        if (heatmapPath) {
          try {
            const hRes = await fetch(`https://www.fotmob.com${heatmapPath}`, {
              headers: FOTMOB_HEADERS,
              next: { revalidate: 86400 },
            });
            if (hRes.ok) {
              const hData = (await hRes.json()) as {
                readonly players?: Record<string, string>;
              };
              const ps = mData.content?.playerStats;
              const sportingOptaKeys = new Set(
                Object.values(ps || {})
                  .filter((p) => p.teamId === FOTMOB_SPORTING_ID && p.optaId)
                  .map((p) => `p${p.optaId}`)
              );
              for (const [key, val] of Object.entries(hData.players || {})) {
                if (sportingOptaKeys.has(key)) {
                  heatmapCircles += val;
                }
              }
            }
          } catch {
            // Silently skip heatmap if unavailable for match
          }
        }

        return {
          goals: matchGoals,
          attackingZones: matchZones || null,
          passTerritory: ownHalf !== null && oppHalf !== null ? { ownHalf, oppHalf } : null,
          heatmapCircles,
        };
      } catch {
        return { goals: [], attackingZones: null, passTerritory: null, heatmapCircles: "" };
      }
    });

    const settledGoals = await Promise.allSettled(goalsPromises);
    const collectedGoals: TeamSeasonGoalItem[] = [];
    let azLeftSum = 0, azCenterSum = 0, azRightSum = 0, azCount = 0;
    let ownPassSum = 0, oppPassSum = 0, passCount = 0;
    let aggregatedHeatmapCircles = "";

    for (const r of settledGoals) {
      if (r.status === "fulfilled") {
        collectedGoals.push(...r.value.goals);
        if (r.value.attackingZones) {
          azLeftSum += r.value.attackingZones.left;
          azCenterSum += r.value.attackingZones.center;
          azRightSum += r.value.attackingZones.right;
          azCount++;
        }
        if (r.value.passTerritory) {
          ownPassSum += r.value.passTerritory.ownHalf;
          oppPassSum += r.value.passTerritory.oppHalf;
          passCount++;
        }
        if (r.value.heatmapCircles) {
          aggregatedHeatmapCircles += r.value.heatmapCircles;
        }
      }
    }

    const totalAz = azLeftSum + azCenterSum + azRightSum;
    const attackingZones = azCount > 0 && totalAz > 0 ? {
      left: Math.round((azLeftSum / totalAz) * 100),
      center: Math.round((azCenterSum / totalAz) * 100),
      right: Math.round((azRightSum / totalAz) * 100),
    } : undefined;

    const totalPasses = ownPassSum + oppPassSum;
    const passTerritory = passCount > 0 && totalPasses > 0 ? {
      ownHalfPasses: Math.round(ownPassSum / passCount),
      oppHalfPasses: Math.round(oppPassSum / passCount),
      ownHalfPct: Math.round((ownPassSum / totalPasses) * 100),
      oppHalfPct: Math.round((oppPassSum / totalPasses) * 100),
    } : undefined;

    const heatmapCirclesSvg = aggregatedHeatmapCircles || undefined;

    const stats = transformFotMobTeamStats(json, collectedGoals, {
      attackingZones,
      passTerritory,
      heatmapCirclesSvg,
    });

      if (stats) {
        memoryCachedTeamStats = {
          data: stats,
          expiresAt: Date.now() + TEAM_STATS_TTL_MS,
        };
        return stats;
      }
    } catch {
      // Return null transparently without fake data
    }

    return null;
  })().finally(() => {
    inFlightTeamStats = null;
  });

  return inFlightTeamStats;
}
