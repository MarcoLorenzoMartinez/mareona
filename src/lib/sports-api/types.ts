import { z } from "zod";
import type { MatchStatus } from "@/types/database.types";
export type { MatchStatus };

export const LALIGA_HYPERMOTION_LEAGUE_ID = 141;
export const SPORTING_GIJON_TEAM_ID = 731;

/**
 * Canonical club name for Real Sporting de Gijón across all domain entities, UI and database.
 * Overwrites external API vendor names (e.g., 'Sporting Gijón', 'Sporting de Gijón').
 */
export const CANONICAL_SPORTING_NAME = "Real Sporting";

/**
 * Normalizes team names across data ingestion boundaries.
 * Enforces CANONICAL_SPORTING_NAME whenever the team corresponds to Sporting.
 *
 * @param name Original name provided by external API.
 * @param isSporting Flag indicating if this team is Sporting.
 * @returns Canonical team name.
 */
export function normalizeTeamName(name: string, isSporting: boolean): string {
  return isSporting ? CANONICAL_SPORTING_NAME : name;
}

/**
 * Canonical league name for LaLiga Hypermotion across all domain entities, UI and database.
 */
export const CANONICAL_LEAGUE_NAME = "LaLiga Hypermotion";

/**
 * Normalizes competition names across external data ingestion boundaries.
 * Enforces CANONICAL_LEAGUE_NAME whenever the league corresponds to Segunda División / LaLiga 2.
 *
 * @param name Original name provided by external API.
 * @returns Canonical competition name.
 */
export function normalizeCompetitionName(name?: string | null): string {
  if (!name) return CANONICAL_LEAGUE_NAME;
  const lower = name.toLowerCase();
  if (
    lower.includes("laliga 2") ||
    lower.includes("la liga 2") ||
    lower.includes("segunda") ||
    lower.includes("hypermotion")
  ) {
    return CANONICAL_LEAGUE_NAME;
  }
  return name;
}

export const DEFAULT_ACTIVE_SEASON_YEAR = 2026;

/**
 * Resolves the starting year of the active football season based on calendar date.
 * European competitions run from July/August to May/June.
 * Months July-December (month index >= 6) belong to season `year`.
 * Months January-June (month index < 6) belong to season `year - 1`.
 *
 * @param date Reference date. When omitted, uses current date dynamically, falling back to DEFAULT_ACTIVE_SEASON_YEAR.
 * @returns 4-digit starting year of the football season.
 */
export function getCurrentSeasonYear(date: Date = new Date()): number {
  if (!date || isNaN(date.getTime())) {
    return DEFAULT_ACTIVE_SEASON_YEAR;
  }
  const year = date.getFullYear();
  const month = date.getMonth();
  return month >= 6 ? year : year - 1;
}

/**
 * Returns the standard formatted label for a season (e.g. "2024/25").
 *
 * @param seasonYear 4-digit season start year (defaults to active season).
 * @returns Formatted season string.
 */
export function getSeasonLabel(seasonYear: number = getCurrentSeasonYear()): string {
  const nextYearShort = String((seasonYear + 1) % 100).padStart(2, "0");
  return `${seasonYear}/${nextYearShort}`;
}

// =====================================================================
// ZOD SCHEMAS: API-Football (v3) Standings
// =====================================================================

export const apiFootballStandingItemSchema = z.object({
  rank: z.number(),
  team: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string().nullable().optional(),
  }),
  points: z.number(),
  goalsDiff: z.number(),
  group: z.string().nullable().optional(),
  form: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  all: z.object({
    played: z.number(),
    win: z.number(),
    draw: z.number(),
    lose: z.number(),
    goals: z.object({
      for: z.number(),
      against: z.number(),
    }),
  }),
});

export const apiFootballStandingsResponseSchema = z.object({
  get: z.string(),
  errors: z.union([z.array(z.string()), z.record(z.string(), z.string())]),
  results: z.number(),
  response: z.array(
    z.object({
      league: z.object({
        id: z.number(),
        name: z.string(),
        season: z.number(),
        standings: z.array(z.array(apiFootballStandingItemSchema)),
      }),
    })
  ),
});

export type ApiFootballStandingItem = z.infer<typeof apiFootballStandingItemSchema>;
export type ApiFootballStandingsResponse = z.infer<typeof apiFootballStandingsResponseSchema>;

// =====================================================================
// ZOD SCHEMAS: API-Football (v3) Fixtures
// =====================================================================

export const apiFootballFixtureItemSchema = z.object({
  fixture: z.object({
    id: z.number(),
    referee: z.string().nullable().optional(),
    timezone: z.string(),
    date: z.string(),
    timestamp: z.number(),
    venue: z.object({
      id: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
    }),
    status: z.object({
      long: z.string(),
      short: z.string(),
      elapsed: z.number().nullable().optional(),
    }),
  }),
  league: z.object({
    id: z.number(),
    name: z.string(),
    season: z.number(),
    round: z.string(),
  }),
  teams: z.object({
    home: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string().nullable().optional(),
      winner: z.boolean().nullable().optional(),
    }),
    away: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string().nullable().optional(),
      winner: z.boolean().nullable().optional(),
    }),
  }),
  goals: z.object({
    home: z.number().nullable().optional(),
    away: z.number().nullable().optional(),
  }),
});

export const apiFootballFixturesResponseSchema = z.object({
  get: z.string(),
  errors: z.union([z.array(z.string()), z.record(z.string(), z.string())]),
  results: z.number(),
  response: z.array(apiFootballFixtureItemSchema),
});

export type ApiFootballFixtureItem = z.infer<typeof apiFootballFixtureItemSchema>;
export type ApiFootballFixturesResponse = z.infer<typeof apiFootballFixturesResponseSchema>;

// =====================================================================
// DOMAIN TYPES: Clean application models
// =====================================================================

export type StandingsViewScope = "total" | "home" | "away";

export interface DomainStandingSplit {
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly points: number;
}

export interface DomainStandingRow {
  readonly position: number;
  readonly teamExternalId: string;
  readonly teamName: string;
  readonly crestUrl: string | null;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly points: number;
  readonly isSporting: boolean;
  readonly home?: DomainStandingSplit;
  readonly away?: DomainStandingSplit;
}

export interface DomainMatchSummary {
  readonly externalId: string;
  readonly competition: string;
  readonly roundName?: string | null;
  readonly season: string;
  readonly matchday: number | null;
  readonly kickoffAt: string;
  readonly status: MatchStatus;
  readonly venue: string | null;
  readonly isTimeConfirmed?: boolean;
  readonly homeTeam: {
    readonly externalId: string;
    readonly name: string;
    readonly crestUrl: string | null;
    readonly isSporting: boolean;
  };
  readonly awayTeam: {
    readonly externalId: string;
    readonly name: string;
    readonly crestUrl: string | null;
    readonly isSporting: boolean;
  };
  readonly homeScore: number | null;
  readonly awayScore: number | null;
}

export type MatchEventType =
  | "goal"
  | "yellowCard"
  | "redCard"
  | "substitution"
  | "penaltyMissed";

export interface DomainMatchEvent {
  readonly id: string;
  readonly type: MatchEventType;
  readonly minute: string;
  readonly minuteSort: number;
  readonly period: number;
  readonly teamId: string;
  readonly isSporting: boolean;
  readonly isHome: boolean;
  readonly score?: string;
  readonly player: {
    readonly id: string;
    readonly name: string;
  };
  readonly secondaryPlayer?: {
    readonly id: string;
    readonly name: string;
  };
}

export interface DomainMatchStatItem {
  readonly key: string;
  readonly label: string;
  readonly homeValue: string;
  readonly awayValue: string;
  readonly homeNumeric: number;
  readonly awayNumeric: number;
  readonly isPercentage?: boolean;
}

export interface DomainMatchStatGroup {
  readonly groupKey: "control" | "attack" | "defense" | "discipline";
  readonly title: string;
  readonly stats: readonly DomainMatchStatItem[];
}

export interface DomainLineupPlayer {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly jersey: number | null;
  readonly position: DomainPlayerPosition;
  readonly positionLabel: string;
  readonly subposition?: string;
  readonly formationPlace: number | null;
  readonly isStarter: boolean;
  readonly subbedIn?: boolean;
  readonly subbedOut?: boolean;
  readonly photoUrl?: string | null;
}

export interface DomainMatchLineup {
  readonly teamId: string;
  readonly teamName: string;
  readonly isSporting: boolean;
  readonly formation: string;
  readonly starters: readonly DomainLineupPlayer[];
  readonly substitutes: readonly DomainLineupPlayer[];
}

export interface DomainShotItem {
  readonly id: number;
  readonly eventType: "Goal" | "AttemptSaved" | "Miss" | "Blocked";
  readonly isGoal: boolean;
  readonly isOnTarget: boolean;
  readonly isBlocked: boolean;
  readonly isHome: boolean;
  readonly isSporting: boolean;
  readonly teamId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly minute: number;
  readonly x: number;
  readonly y: number;
  readonly expectedGoals: number;
  readonly expectedGoalsOnTarget: number | null;
  readonly onGoalShot?: { readonly x: number; readonly y: number } | null;
  readonly goalCrossedZ?: number | null;
  readonly shotType: string;
  readonly situation: string;
}

export interface DomainAttackingZones {
  readonly home: { readonly left: number; readonly center: number; readonly right: number };
  readonly away: { readonly left: number; readonly center: number; readonly right: number };
}

export interface DomainPlayerMatchStats {
  readonly id: number;
  readonly name: string;
  readonly shirtNumber?: string;
  readonly isGoalkeeper: boolean;
  readonly rating: number | null;
  readonly minutesPlayed: number;
  readonly goals: number;
  readonly assists: number;
  readonly expectedGoals: number | null;
  readonly expectedGoalsOnTarget: number | null;
  readonly chancesCreated: number;
  readonly totalShots: number;
  readonly shotsOnTarget: number;
  readonly touchesInBox: number;
  readonly passesFinalThird: number;
  readonly touches: number;
  readonly dispossessed: number;
  readonly accuratePasses: number;
  readonly totalPasses: number;
  readonly accurateLongBalls: number;
  readonly totalLongBalls: number;
  readonly defensiveActions: number;
  readonly tacklesWon: number;
  readonly interceptions: number;
  readonly recoveries: number;
  readonly clearances: number;
  readonly blocks: number;
  readonly dribbledPast: number;
  readonly duelsWon: number;
  readonly duelsLost: number;
  readonly groundDuelsWon: number;
  readonly totalGroundDuels: number;
  readonly aerialDuelsWon: number;
  readonly totalAerialDuels: number;
  readonly wasFouled: number;
  readonly foulsCommitted: number;
  readonly saves?: number;
  readonly savesInsideBox?: number;
  readonly goalsConceded?: number;
  readonly xgotFaced?: number | null;
  readonly goalsPrevented?: number | null;
  readonly highClaims?: number;
  readonly punches?: number;
}

export interface DomainAdvancedStats {
  readonly homeXg: number;
  readonly awayXg: number;
  readonly homeXgOpenPlay?: number;
  readonly awayXgOpenPlay?: number;
  readonly homeXgSetPlay?: number;
  readonly awayXgSetPlay?: number;
  readonly homeXgot?: number;
  readonly awayXgot?: number;
  readonly homeBigChances: number;
  readonly awayBigChances: number;
  readonly homeBigChancesMissed: number;
  readonly awayBigChancesMissed: number;
  readonly homeBoxTouches: number;
  readonly awayBoxTouches: number;
  readonly homeShotsInsideBox?: number;
  readonly awayShotsInsideBox?: number;
  readonly homeShotsOutsideBox?: number;
  readonly awayShotsOutsideBox?: number;
  readonly homePassesOwnHalf?: number;
  readonly awayPassesOwnHalf?: number;
  readonly homePassesOppHalf?: number;
  readonly awayPassesOppHalf?: number;
  readonly homeDuelsWon: number;
  readonly awayDuelsWon: number;
  readonly homeGroundDuelsWon?: string | number;
  readonly awayGroundDuelsWon?: string | number;
  readonly homeAerialDuelsWon?: string | number;
  readonly awayAerialDuelsWon?: string | number;
  readonly homeDribblesWon?: string | number;
  readonly awayDribblesWon?: string | number;
  readonly attackingZones?: DomainAttackingZones;
  readonly momentum?: ReadonlyArray<{ readonly minute: number; readonly value: number }>;
  readonly shots: readonly DomainShotItem[];
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>>;
  readonly goalAssists?: ReadonlyArray<{
    readonly minute: number;
    readonly scorerName: string;
    readonly assistantName: string;
  }>;
  readonly tacticalLineups?: {
    readonly home: DomainTacticalLineup;
    readonly away: DomainTacticalLineup;
  } | null;
}

export interface DomainTacticalStarter {
  readonly id: number;
  readonly name: string;
  readonly shirtNumber: string;
  readonly x: number;
  readonly y: number;
  readonly photoUrl: string;
  readonly rating?: number | null;
}

export interface DomainTacticalLineup {
  readonly formation: string;
  readonly starters: readonly DomainTacticalStarter[];
}

export interface DomainMatchDetail {
  readonly externalId: string;
  readonly competition: string;
  readonly roundName?: string | null;
  readonly season: string;
  readonly matchday: number | null;
  readonly kickoffAt: string;
  readonly status: MatchStatus;
  readonly isTimeConfirmed: boolean;
  readonly venue: {
    readonly name: string | null;
    readonly city: string | null;
  } | null;
  readonly attendance: number | null;
  readonly homeTeam: {
    readonly externalId: string;
    readonly name: string;
    readonly crestUrl: string | null;
    readonly isSporting: boolean;
  };
  readonly awayTeam: {
    readonly externalId: string;
    readonly name: string;
    readonly crestUrl: string | null;
    readonly isSporting: boolean;
  };
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly events: readonly DomainMatchEvent[];
  readonly statGroups: readonly DomainMatchStatGroup[];
  readonly homeLineup: DomainMatchLineup | null;
  readonly awayLineup: DomainMatchLineup | null;
  readonly tacticalLineups?: {
    readonly home: DomainTacticalLineup;
    readonly away: DomainTacticalLineup;
  } | null;
  readonly advancedStats?: DomainAdvancedStats | null;
}

// =====================================================================
// ZOD SCHEMAS: ESPN Match Summary
// =====================================================================

export const espnMatchStatisticItemSchema = z.object({
  name: z.string(),
  displayValue: z.string(),
  label: z.string().optional(),
});

export const espnMatchKeyEventSchema = z.object({
  id: z.string().optional(),
  text: z.string().optional(),
  type: z
    .object({
      id: z.string().optional(),
      text: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
  clock: z
    .object({
      value: z.number().optional(),
      displayValue: z.string().optional(),
    })
    .optional(),
  period: z
    .object({
      number: z.number().optional(),
    })
    .optional(),
  scoringPlay: z.boolean().optional(),
  shootout: z.boolean().optional(),
  team: z
    .object({
      id: z.string().optional(),
      displayName: z.string().optional(),
    })
    .optional(),
  participants: z
    .array(
      z.object({
        athlete: z
          .object({
            id: z.string().optional(),
            displayName: z.string().optional(),
          })
          .optional(),
      })
    )
    .optional()
    .default([]),
});

export const espnRosterAthleteSchema = z.object({
  active: z.boolean().optional(),
  starter: z.boolean().optional(),
  jersey: z.string().optional(),
  formationPlace: z.string().optional(),
  subbedIn: z.boolean().optional(),
  subbedOut: z.boolean().optional(),
  athlete: z.object({
    id: z.string(),
    displayName: z.string(),
    fullName: z.string().optional(),
    shortName: z.string().optional(),
    headshot: z.object({ href: z.string().optional() }).optional(),
  }),
  position: z
    .object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      abbreviation: z.string().optional(),
    })
    .optional(),
});

export const espnRosterTeamSchema = z.object({
  team: z
    .object({
      id: z.string().optional(),
      displayName: z.string().optional(),
    })
    .optional(),
  formation: z.string().optional(),
  roster: z.array(espnRosterAthleteSchema).optional().default([]),
});

export const espnMatchSummaryCompetitorSchema = z.object({
  id: z.string(),
  homeAway: z.enum(["home", "away"]),
  score: z
    .union([z.string(), z.number(), z.object({ value: z.number().optional() })])
    .optional(),
  team: z.object({
    id: z.string(),
    displayName: z.string(),
    abbreviation: z.string().optional(),
    logo: z.string().optional(),
    logos: z.array(z.object({ href: z.string() })).optional(),
  }),
});

export const espnMatchSummaryResponseSchema = z.object({
  header: z.object({
    id: z.string(),
    season: z
      .object({
        year: z.number().optional(),
        name: z.string().optional(),
      })
      .optional(),
    league: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    competitions: z.array(
      z.object({
        id: z.string(),
        date: z.string(),
        timeValid: z.boolean().optional(),
        status: z.object({
          type: z.object({
            state: z.string(),
            description: z.string().optional(),
            detail: z.string().optional(),
            shortDetail: z.string().optional(),
          }),
        }),
        competitors: z.array(espnMatchSummaryCompetitorSchema),
      })
    ),
  }),
  gameInfo: z
    .object({
      venue: z
        .object({
          id: z.string().optional(),
          fullName: z.string().optional(),
          shortName: z.string().optional(),
          address: z
            .object({
              city: z.string().optional(),
              country: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      attendance: z.number().nullable().optional(),
    })
    .optional(),
  boxscore: z
    .object({
      teams: z
        .array(
          z.object({
            team: z
              .object({
                id: z.string().optional(),
                displayName: z.string().optional(),
              })
              .optional(),
            statistics: z.array(espnMatchStatisticItemSchema).optional().default([]),
          })
        )
        .optional()
        .default([]),
    })
    .optional(),
  rosters: z.array(espnRosterTeamSchema).optional(),
  keyEvents: z.array(espnMatchKeyEventSchema).optional(),
});

export type EspnMatchSummaryResponse = z.infer<typeof espnMatchSummaryResponseSchema>;

// =====================================================================
// TRANSFORMERS
// =====================================================================

/**
 * Maps raw API-Football short status codes to Mareona match_status enum.
 */
function mapMatchStatus(shortStatus: string): MatchStatus {
  switch (shortStatus) {
    case "1H":
    case "2H":
    case "HT":
    case "ET":
    case "P":
    case "LIVE":
      return "live";
    case "FT":
    case "AET":
    case "PEN":
      return "finished";
    case "PST":
      return "postponed";
    case "CANC":
    case "ABD":
      return "cancelled";
    case "TBD":
    case "NS":
    default:
      return "scheduled";
  }
}

/**
 * Extracts matchday number from API round string (e.g. "Regular Season - 10" -> 10).
 */
function parseMatchday(roundStr: string): number | null {
  const match = roundStr.match(/\d+$/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Transforms an API-Football standings row into a clean domain model.
 */
export function transformStandingRow(item: ApiFootballStandingItem): DomainStandingRow {
  const isSporting = item.team.id === SPORTING_GIJON_TEAM_ID;

  return {
    position: item.rank,
    teamExternalId: String(item.team.id),
    teamName: normalizeTeamName(item.team.name, isSporting),
    crestUrl: item.team.logo ?? null,
    played: item.all.played,
    won: item.all.win,
    drawn: item.all.draw,
    lost: item.all.lose,
    goalsFor: item.all.goals.for,
    goalsAgainst: item.all.goals.against,
    points: item.points,
    isSporting,
  };
}

/**
 * Transforms an API-Football fixture into a clean domain match summary.
 */
export function transformFixture(item: ApiFootballFixtureItem): DomainMatchSummary {
  const isHomeSporting = item.teams.home.id === SPORTING_GIJON_TEAM_ID;
  const isAwaySporting = item.teams.away.id === SPORTING_GIJON_TEAM_ID;

  return {
    externalId: String(item.fixture.id),
    competition: normalizeCompetitionName(item.league.name),
    season: String(item.league.season),
    matchday: parseMatchday(item.league.round),
    kickoffAt: item.fixture.date,
    status: mapMatchStatus(item.fixture.status.short),
    venue: item.fixture.venue.name ?? null,
    homeTeam: {
      externalId: String(item.teams.home.id),
      name: normalizeTeamName(item.teams.home.name, isHomeSporting),
      crestUrl: item.teams.home.logo ?? null,
      isSporting: isHomeSporting,
    },
    awayTeam: {
      externalId: String(item.teams.away.id),
      name: normalizeTeamName(item.teams.away.name, isAwaySporting),
      crestUrl: item.teams.away.logo ?? null,
      isSporting: isAwaySporting,
    },
    homeScore: item.goals.home ?? null,
    awayScore: item.goals.away ?? null,
  };
}

/**
 * Normalizes vendor athlete names, repairing known database omissions.
 * Example: ESPN lists Jorge Sáenz (jersey #23) as just "Jorge".
 */
export function normalizeAthleteName(athlete: {
  readonly id?: string;
  readonly displayName?: string;
  readonly fullName?: string;
  readonly shortName?: string;
}): { readonly name: string; readonly shortName: string } {
  const rawName = (athlete.displayName || athlete.fullName || "").trim();
  const rawShort = (athlete.shortName || athlete.displayName || rawName).trim();

  if (
    athlete.id === "209736" ||
    rawName.toLowerCase() === "jorge" ||
    rawShort.toLowerCase() === "jorge"
  ) {
    return { name: "Jorge Sáenz", shortName: "J. Sáenz" };
  }

  return { name: rawName, shortName: rawShort };
}

/**
 * Transforms an ESPN match summary response into a clean DomainMatchDetail.
 * Normalizes team names ensuring Real Sporting canonical name,
 * and extracts venue and real attendance following the zero fake data policy.
 *
 * @param data Parsed ESPN match summary response.
 * @param matchday Optional matchday number (Jornada) if known.
 * @returns Clean DomainMatchDetail or null if competitors are missing.
 */
export function transformEspnMatchDetail(
  data: EspnMatchSummaryResponse,
  matchday: number | null = null
): DomainMatchDetail | null {
  const comp = data.header.competitions[0];
  if (!comp) {
    return null;
  }

  const homeComp = comp.competitors.find((c) => c.homeAway === "home");
  const awayComp = comp.competitors.find((c) => c.homeAway === "away");

  if (!homeComp || !awayComp) {
    return null;
  }

  const isHomeSporting =
    homeComp.team.id === "3788" ||
    homeComp.team.id === "731" ||
    homeComp.team.displayName.toLowerCase().includes("sporting") ||
    homeComp.team.abbreviation === "RSG";

  const isAwaySporting =
    awayComp.team.id === "3788" ||
    awayComp.team.id === "731" ||
    awayComp.team.displayName.toLowerCase().includes("sporting") ||
    awayComp.team.abbreviation === "RSG";

  const parseScore = (scoreVal: unknown): number | null => {
    if (scoreVal === undefined || scoreVal === null) return null;
    if (typeof scoreVal === "number") return scoreVal;
    if (typeof scoreVal === "object" && "value" in (scoreVal as Record<string, unknown>)) {
      const val = (scoreVal as { value?: number }).value;
      return typeof val === "number" ? val : null;
    }
    if (typeof scoreVal === "string") {
      const n = parseInt(scoreVal, 10);
      return isNaN(n) ? null : n;
    }
    return null;
  };

  const isFinished = comp.status.type.state === "post";
  const isLive = comp.status.type.state === "in";
  const status: MatchStatus = isFinished ? "finished" : isLive ? "live" : "scheduled";

  const homeScore = isFinished || isLive ? parseScore(homeComp.score) : null;
  const awayScore = isFinished || isLive ? parseScore(awayComp.score) : null;

  const homeLogo = homeComp.team.logo ?? homeComp.team.logos?.[0]?.href ?? null;
  const awayLogo = awayComp.team.logo ?? awayComp.team.logos?.[0]?.href ?? null;

  const venueName = data.gameInfo?.venue?.fullName ?? data.gameInfo?.venue?.shortName ?? null;
  const venueCity = data.gameInfo?.venue?.address?.city ?? null;
  const attendance = data.gameInfo?.attendance ?? null;

  const isTbd =
    comp.timeValid === false ||
    comp.status.type.shortDetail?.toUpperCase() === "TBD" ||
    comp.status.type.detail?.toUpperCase().includes("TBD") ||
    comp.status.type.description?.toUpperCase().includes("TBD");

  const isTimeConfirmed = !isTbd && comp.timeValid !== false;

  // Extract key match events (goals, cards, substitutions, missed penalties)
  const rawEvents = data.keyEvents ?? [];
  const parsedEvents: DomainMatchEvent[] = [];

  rawEvents.forEach((e, idx) => {
    const rawType = (e.type?.type || e.type?.text || "").toLowerCase();
    const rawText = (e.text || "").toLowerCase();

    // 1. Determine event type strictly; NEVER default to "goal"
    let type: MatchEventType | null = null;
    if (
      rawType.includes("yellow") &&
      !rawType.includes("second") &&
      !rawText.includes("second yellow")
    ) {
      type = "yellowCard";
    } else if (
      rawType.includes("red") ||
      rawType.includes("second-yellow") ||
      rawText.includes("second yellow")
    ) {
      type = "redCard";
    } else if (rawType.includes("sub")) {
      type = "substitution";
    } else if (
      rawType.includes("penalty---missed") ||
      rawType.includes("penalty---saved") ||
      (rawType.includes("penalt") && (rawType.includes("miss") || rawType.includes("save"))) ||
      (rawText.includes("penalt") && (rawText.includes("miss") || rawText.includes("save")))
    ) {
      type = "penaltyMissed";
    } else if (
      !e.shootout &&
      !rawType.includes("disallow") &&
      !rawText.includes("disallow") &&
      !rawText.includes("cancelled") &&
      !rawType.includes("var") &&
      (e.scoringPlay === true ||
        rawType === "goal" ||
        rawType === "own-goal" ||
        rawType === "penalty" ||
        rawType === "penalty---scored" ||
        rawText.includes("goal"))
    ) {
      type = "goal";
    }

    // Ignore unhandled/administrative events (e.g. fouls, offsides, VAR reviews without goal)
    if (!type) return;

    const minuteStr = e.clock?.displayValue ?? "";
    const parsedMin = parseInt(minuteStr.replace(/\D/g, ""), 10);
    const minuteSort =
      e.clock?.value ?? (!Number.isNaN(parsedMin) ? parsedMin * 60 : idx);

    const isSporting =
      e.team?.id === "3788" ||
      e.team?.id === "731" ||
      Boolean(e.team?.displayName?.toLowerCase().includes("sporting"));

    const isHome = e.team?.id === homeComp.team.id;
    const p0 = e.participants?.[0]?.athlete;
    const p1 = e.participants?.[1]?.athlete;

    const p0Name = normalizeAthleteName({
      id: p0?.id,
      displayName: p0?.displayName ?? e.text,
    }).name;

    const p1Name = p1?.displayName
      ? normalizeAthleteName({ id: p1.id, displayName: p1.displayName }).name
      : undefined;

    parsedEvents.push({
      id: e.id ?? `event-${idx}`,
      type,
      minute: minuteStr,
      minuteSort,
      period: e.period?.number ?? 1,
      teamId: e.team?.id ?? "",
      isSporting,
      isHome,
      player: {
        id: p0?.id ?? "",
        name: p0Name,
      },
      secondaryPlayer: p1Name
        ? { id: p1?.id ?? "", name: p1Name }
        : undefined,
    });
  });

  parsedEvents.sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period;
    return a.minuteSort - b.minuteSort;
  });

  // Discard any phantom goals if the official finished match score for that team is 0
  const validatedEvents = parsedEvents.filter((ev) => {
    if (ev.type === "goal" && isFinished) {
      if (ev.isHome && homeScore === 0) return false;
      if (!ev.isHome && awayScore === 0) return false;
    }
    return true;
  });

  let runningHomeScore = 0;
  let runningAwayScore = 0;
  const eventsWithScores: DomainMatchEvent[] = validatedEvents.map((ev) => {
    if (ev.type === "goal") {
      if (ev.isHome) {
        runningHomeScore += 1;
      } else {
        runningAwayScore += 1;
      }
      return {
        ...ev,
        score: `${runningHomeScore} - ${runningAwayScore}`,
      };
    }
    return ev;
  });

  // Extract boxscore statistics
  const homeBox = data.boxscore?.teams.find((t) => t.team?.id === homeComp.team.id);
  const awayBox = data.boxscore?.teams.find((t) => t.team?.id === awayComp.team.id);

  const homeStatsMap = new Map<string, string>();
  for (const s of homeBox?.statistics ?? []) {
    homeStatsMap.set(s.name, s.displayValue);
  }
  const awayStatsMap = new Map<string, string>();
  for (const s of awayBox?.statistics ?? []) {
    awayStatsMap.set(s.name, s.displayValue);
  }

  const parseNum = (v: string | undefined): number => {
    if (!v) return 0;
    const clean = v.replace("%", "").trim();
    const n = parseFloat(clean);
    return Number.isNaN(n) ? 0 : n;
  };

  const formatStat = (
    key: string,
    rawVal: string | undefined,
    map: Map<string, string>,
    totalKey?: string,
    partKey?: string
  ): string => {
    if (rawVal === undefined) return "0";
    if (key === "possessionPct") {
      return rawVal.includes("%") ? rawVal : `${rawVal}%`;
    }
    if (totalKey && partKey) {
      const total = parseNum(map.get(totalKey));
      const part = parseNum(map.get(partKey));
      if (total > 0) {
        return `${Math.round((part / total) * 100)}%`;
      }
    }
    if (key.endsWith("Pct") || key.endsWith("Percentage")) {
      const num = parseNum(rawVal);
      if (num > 0 && num <= 1 && !rawVal.includes("%")) {
        return `${Math.round(num * 100)}%`;
      }
      if (!rawVal.includes("%") && rawVal !== "0") {
        return `${rawVal}%`;
      }
    }
    return rawVal;
  };

  const STAT_CONFIGS: Array<{
    key: string;
    aliasKey?: string;
    label: string;
    group: "control" | "attack" | "defense" | "discipline";
    isPct?: boolean;
    totalKey?: string;
    partKey?: string;
  }> = [
    // Control
    { key: "possessionPct", label: "Posesión", group: "control", isPct: true },
    { key: "totalPasses", label: "Pases totales", group: "control" },
    { key: "accuratePasses", label: "Pases acertados", group: "control" },
    {
      key: "passPct",
      label: "Precisión de pase",
      group: "control",
      isPct: true,
      totalKey: "totalPasses",
      partKey: "accuratePasses",
    },
    // Attack
    { key: "totalShots", aliasKey: "shotsTotal", label: "Tiros totales", group: "attack" },
    { key: "shotsOnTarget", label: "Tiros a puerta", group: "attack" },
    {
      key: "shotPct",
      label: "Efectividad de tiro",
      group: "attack",
      isPct: true,
      totalKey: "totalShots",
      partKey: "shotsOnTarget",
    },
    { key: "blockedShots", label: "Tiros bloqueados", group: "attack" },
    { key: "wonCorners", label: "Córners", group: "attack" },
    // Defense
    { key: "totalTackles", label: "Entradas", group: "defense" },
    { key: "effectiveTackles", label: "Entradas con éxito", group: "defense" },
    {
      key: "tacklePct",
      label: "Efectividad de entradas",
      group: "defense",
      isPct: true,
      totalKey: "totalTackles",
      partKey: "effectiveTackles",
    },
    { key: "totalClearance", label: "Despejes", group: "defense" },
    { key: "saves", label: "Paradas del portero", group: "defense" },
    // Discipline
    { key: "foulsCommitted", label: "Faltas cometidas", group: "discipline" },
    { key: "yellowCards", label: "Tarjetas amarillas", group: "discipline" },
    { key: "redCards", label: "Tarjetas rojas", group: "discipline" },
    { key: "offsides", label: "Fueras de juego", group: "discipline" },
  ];

  const groupTitles: Record<"control" | "attack" | "defense" | "discipline", string> = {
    control: "Posesión",
    attack: "Remates",
    defense: "Defensa",
    discipline: "Disciplina",
  };

  const statGroups: DomainMatchStatGroup[] = [];
  const groups: Array<"control" | "attack" | "defense" | "discipline"> = [
    "control",
    "attack",
    "defense",
    "discipline",
  ];

  for (const grp of groups) {
    const itemsInGrp = STAT_CONFIGS.filter((c) => c.group === grp);
    const validStats: DomainMatchStatItem[] = [];

    for (const cfg of itemsInGrp) {
      const hVal = homeStatsMap.get(cfg.key) ?? (cfg.aliasKey ? homeStatsMap.get(cfg.aliasKey) : undefined);
      const aVal = awayStatsMap.get(cfg.key) ?? (cfg.aliasKey ? awayStatsMap.get(cfg.aliasKey) : undefined);
      if (hVal !== undefined || aVal !== undefined) {
        const homeValue = formatStat(cfg.key, hVal, homeStatsMap, cfg.totalKey, cfg.partKey);
        const awayValue = formatStat(cfg.key, aVal, awayStatsMap, cfg.totalKey, cfg.partKey);
        validStats.push({
          key: cfg.key,
          label: cfg.label,
          homeValue,
          awayValue,
          homeNumeric: parseNum(homeValue),
          awayNumeric: parseNum(awayValue),
          isPercentage: cfg.isPct,
        });
      }
    }

    if (validStats.length > 0) {
      statGroups.push({
        groupKey: grp,
        title: groupTitles[grp],
        stats: validStats,
      });
    }
  }

  // Extract rosters & lineups
  const transformLineup = (
    teamCompId: string,
    teamName: string,
    isSportingTeam: boolean
  ): DomainMatchLineup | null => {
    const rTeam = data.rosters?.find(
      (r) =>
        r.team?.id === teamCompId ||
        r.team?.displayName?.toLowerCase() === teamName.toLowerCase()
    );
    if (!rTeam || rTeam.roster.length === 0) return null;

    const mapTacticalPosition = (
      rawAbbr?: string,
      rawName?: string,
      pos?: DomainPlayerPosition
    ): { rank: number; subpos: string } => {
      const abbr = (rawAbbr ?? "").toUpperCase();
      const name = (rawName ?? "").toLowerCase();

      if (pos === "goalkeeper" || abbr === "G" || abbr === "GK" || name.includes("goalkeeper")) {
        return { rank: 100, subpos: "POR" };
      }
      if (pos === "defender" || abbr.startsWith("C") || abbr.endsWith("B") || name.includes("defender")) {
        if (abbr.includes("LB") || abbr.includes("LWB") || name.includes("left back")) return { rank: 210, subpos: "LI" };
        if (abbr.includes("CD-L") || abbr.includes("CB-L") || abbr.includes("LCB") || name.includes("center left")) return { rank: 220, subpos: "DFC" };
        if (abbr.includes("CD-R") || abbr.includes("CB-R") || abbr.includes("RCB") || name.includes("center right")) return { rank: 240, subpos: "DFC" };
        if (abbr.includes("RB") || abbr.includes("RWB") || name.includes("right back")) return { rank: 250, subpos: "LD" };
        return { rank: 230, subpos: "DFC" };
      }
      if (pos === "midfielder" || abbr.includes("M") || name.includes("midfield")) {
        if (abbr.includes("LM") || abbr.includes("LW") || abbr.includes("AM-L") || abbr.includes("AML") || name.includes("left")) return { rank: 310, subpos: "MI" };
        if (abbr.includes("DM-L") || abbr.includes("CM-L") || abbr.includes("DML") || abbr.includes("CML")) return { rank: 320, subpos: "MC" };
        if (abbr.includes("DM-R") || abbr.includes("CM-R") || abbr.includes("DMR") || abbr.includes("CMR")) return { rank: 340, subpos: "MC" };
        if (abbr.includes("RM") || abbr.includes("RW") || abbr.includes("AM-R") || abbr.includes("AMR") || name.includes("right")) return { rank: 350, subpos: "MD" };
        if (abbr.includes("DM") || abbr.includes("CDM") || name.includes("defensive")) return { rank: 330, subpos: "MCD" };
        if (abbr.includes("AM") || abbr.includes("CAM") || name.includes("attacking")) return { rank: 335, subpos: "MP" };
        return { rank: 330, subpos: "MC" };
      }
      if (abbr.includes("LF") || abbr.includes("LS") || name.includes("left")) return { rank: 410, subpos: "EI" };
      if (abbr.includes("RF") || abbr.includes("RS") || name.includes("right")) return { rank: 430, subpos: "ED" };
      return { rank: 420, subpos: "DC" };
    };

    const mapPlayer = (
      p: z.infer<typeof espnRosterAthleteSchema>,
      subposition?: string
    ): DomainLineupPlayer => {
      const jerseyNum = p.jersey ? parseInt(p.jersey, 10) : null;
      const placeNum = p.formationPlace ? parseInt(p.formationPlace, 10) : null;
      const pos = mapEspnPosition(p.position?.name ?? p.position?.displayName);
      const normalized = normalizeAthleteName({
        id: p.athlete.id,
        displayName: p.athlete.displayName,
        fullName: p.athlete.fullName,
        shortName: p.athlete.shortName,
      });
      const photoUrl =
        (isSportingTeam && jerseyNum !== null ? `/images/players/${jerseyNum}.png` : null) ??
        p.athlete.headshot?.href ??
        null;

      return {
        id: p.athlete.id,
        name: normalized.name,
        shortName: normalized.shortName,
        jersey: jerseyNum !== null && !Number.isNaN(jerseyNum) ? jerseyNum : null,
        position: pos,
        positionLabel: mapPositionToLabel(pos),
        subposition: subposition ?? mapPositionToShort(pos),
        formationPlace: placeNum !== null && !Number.isNaN(placeNum) ? placeNum : null,
        isStarter: Boolean(p.starter),
        subbedIn: p.subbedIn,
        subbedOut: p.subbedOut,
        photoUrl,
      };
    };

    const starters = rTeam.roster
      .filter((p) => p.starter)
      .map((p) => {
        const tactical = mapTacticalPosition(
          p.position?.abbreviation,
          p.position?.name ?? p.position?.displayName,
          mapEspnPosition(p.position?.name ?? p.position?.displayName)
        );
        return {
          player: mapPlayer(p, tactical.subpos),
          rank: tactical.rank,
        };
      })
      .sort((a, b) => a.rank - b.rank || (a.player.formationPlace ?? 99) - (b.player.formationPlace ?? 99))
      .map((item) => item.player);

    const substitutes = rTeam.roster
      .filter((p) => !p.starter)
      .map((p) => {
        const tactical = mapTacticalPosition(
          p.position?.abbreviation,
          p.position?.name ?? p.position?.displayName,
          mapEspnPosition(p.position?.name ?? p.position?.displayName)
        );
        return {
          player: mapPlayer(p, tactical.subpos),
          rank: tactical.rank,
        };
      })
      .sort((a, b) => a.rank - b.rank || (a.player.jersey ?? 99) - (b.player.jersey ?? 99))
      .map((item) => item.player);

    return {
      teamId: teamCompId,
      teamName,
      isSporting: isSportingTeam,
      formation: rTeam.formation || "4-2-3-1",
      starters,
      substitutes,
    };
  };

  const homeLineup = transformLineup(
    homeComp.team.id,
    normalizeTeamName(homeComp.team.displayName, isHomeSporting),
    isHomeSporting
  );
  const awayLineup = transformLineup(
    awayComp.team.id,
    normalizeTeamName(awayComp.team.displayName, isAwaySporting),
    isAwaySporting
  );

  return {
    externalId: data.header.id,
    competition: normalizeCompetitionName(data.header.league?.name),
    season: getSeasonLabel(),
    matchday,
    kickoffAt: comp.date,
    status,
    isTimeConfirmed,
    venue: venueName ? { name: venueName, city: venueCity } : null,
    attendance,
    homeTeam: {
      externalId: homeComp.team.id,
      name: normalizeTeamName(homeComp.team.displayName, isHomeSporting),
      crestUrl: homeLogo,
      isSporting: isHomeSporting,
    },
    awayTeam: {
      externalId: awayComp.team.id,
      name: normalizeTeamName(awayComp.team.displayName, isAwaySporting),
      crestUrl: awayLogo,
      isSporting: isAwaySporting,
    },
    homeScore,
    awayScore,
    events: eventsWithScores,
    statGroups,
    homeLineup,
    awayLineup,
  };
}

/**
 * Resolves and sorts standings rows according to the selected view scope:
 * - "total": Canonical overall standings order.
 * - "home": Re-ranks clubs based on home split metrics (points, goal difference, goals for).
 * - "away": Re-ranks clubs based on away split metrics (points, goal difference, goals for).
 *
 * @param rows Initial standings list.
 * @param scope Desired scope ("total" | "home" | "away").
 * @returns Sorted and position-indexed standings list.
 */
export function getSortedStandings(
  rows: readonly DomainStandingRow[],
  scope: StandingsViewScope
): readonly DomainStandingRow[] {
  if (scope === "total") {
    return rows;
  }

  const items = rows.map((row) => {
    const split = scope === "home" ? row.home : row.away;
    if (!split) {
      return row;
    }
    return {
      ...row,
      played: split.played,
      won: split.won,
      drawn: split.drawn,
      lost: split.lost,
      goalsFor: split.goalsFor,
      goalsAgainst: split.goalsAgainst,
      points: split.points,
    };
  });

  items.sort((a, b) => {
    // 1. Points descending
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // 2. Goal difference descending
    const gdB = b.goalsFor - b.goalsAgainst;
    const gdA = a.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) {
      return gdB - gdA;
    }
    // 3. Goals for descending
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    // 4. Stable fallback
    return a.teamName.localeCompare(b.teamName);
  });

  return items.map((item, index) => ({
    ...item,
    position: index + 1,
  }));
}

export interface RealDistanceRung {
  readonly points: number;
  readonly teams: readonly DomainStandingRow[];
}

/**
 * Computes a continuous mathematical point scale (Real Distance Ladder)
 * from the maximum points down to the minimum points across all participating clubs.
 *
 * @param rows Standings rows.
 * @returns Ordered rungs from max to min points, preserving gaps for point differentials.
 */
export function getRealDistanceLadder(
  rows: readonly DomainStandingRow[]
): readonly RealDistanceRung[] {
  if (rows.length === 0) {
    return [];
  }

  let maxPoints = rows[0].points;
  let minPoints = rows[0].points;

  for (const r of rows) {
    if (r.points > maxPoints) maxPoints = r.points;
    if (r.points < minPoints) minPoints = r.points;
  }

  // Group teams by exact point tally
  const map = new Map<number, DomainStandingRow[]>();
  for (const r of rows) {
    const list = map.get(r.points) ?? [];
    list.push(r);
    map.set(r.points, list);
  }

  const ladder: RealDistanceRung[] = [];
  for (let pt = maxPoints; pt >= minPoints; pt--) {
    const teams = map.get(pt) ?? [];
    ladder.push({
      points: pt,
      teams,
    });
  }

  return ladder;
}

export interface MatchdayEvolutionPoint {
  readonly matchday: number;
  readonly opponent: string;
  readonly isHome: boolean;
  readonly result: "W" | "D" | "L";
  readonly score: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly homeCrestUrl?: string | null;
  readonly awayCrestUrl?: string | null;
  readonly matchPoints: number;
  readonly cumulativePoints: number;
  readonly position: number;
}

/**
 * Historical league positions for Real Sporting in 2026/27 after each matchday (Jornadas 1..9).
 */
export const SPORTING_HISTORICAL_POSITIONS: Readonly<Record<number, number>> = {
  1: 5,
  2: 2,
  3: 5,
  4: 3,
  5: 7,
  6: 11,
  7: 8,
  8: 5,
  9: 6,
};

/**
 * Computes the matchday-by-matchday evolution of points and league table positions for Real Sporting.
 * Only finished matches are evaluated, ordered sequentially by matchday.
 *
 * @param matches Full or partial season matches list.
 * @param sportingStanding Optional current standing row for Real Sporting to sync the latest position.
 * @returns Ordered array of MatchdayEvolutionPoint items.
 */
export function getSportingSeasonEvolution(
  matches: readonly DomainMatchSummary[],
  sportingStanding?: DomainStandingRow | null
): readonly MatchdayEvolutionPoint[] {
  const finished = matches
    .filter(
      (m): m is DomainMatchSummary & { readonly matchday: number } =>
        m.matchday !== null &&
        m.status === "finished" &&
        m.homeScore !== null &&
        m.awayScore !== null
    )
    .slice()
    .sort((a, b) => a.matchday - b.matchday);

  if (finished.length === 0) {
    return [];
  }

  let cumulativePoints = 0;
  const evolution: MatchdayEvolutionPoint[] = [];

  for (let i = 0; i < finished.length; i++) {
    const match = finished[i];
    if (!match || match.homeScore === null || match.awayScore === null) continue;

    const isHome = match.homeTeam.isSporting;
    const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
    const sportingScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;

    const result: "W" | "D" | "L" =
      sportingScore > opponentScore
        ? "W"
        : sportingScore === opponentScore
        ? "D"
        : "L";

    const matchPoints = result === "W" ? 3 : result === "D" ? 1 : 0;
    cumulativePoints += matchPoints;

    const isCurrentMatchday =
      sportingStanding !== undefined &&
      sportingStanding !== null &&
      match.matchday === sportingStanding.played;

    const position = isCurrentMatchday
      ? sportingStanding.position
      : (SPORTING_HISTORICAL_POSITIONS[match.matchday] ??
        sportingStanding?.position ??
        1);

    evolution.push({
      matchday: match.matchday,
      opponent,
      isHome,
      result,
      score: `${match.homeScore}-${match.awayScore}`,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homeTeamName: match.homeTeam.name,
      awayTeamName: match.awayTeam.name,
      homeCrestUrl: match.homeTeam.crestUrl,
      awayCrestUrl: match.awayTeam.crestUrl,
      matchPoints,
      cumulativePoints,
      position,
    });
  }

  return evolution;
}

// =====================================================================
// SQUAD & PLAYER DOMAIN TYPES
// =====================================================================

export type DomainPlayerPosition =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "forward";

export interface DomainPlayerStats {
  readonly appearances: number;
  readonly goals: number;
  readonly assists: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly saves?: number;
  readonly goalsConceded?: number;
}

export interface DomainPlayer {
  readonly id: string;
  readonly externalId: string;
  readonly fullName: string;
  readonly displayName: string;
  readonly shortName: string;
  readonly shirtNumber: number | null;
  readonly position: DomainPlayerPosition;
  readonly positionLabel: string;
  readonly positionShort: string;
  readonly age: number | null;
  readonly birthDate: string | null;
  readonly nationality: string | null;
  readonly flagUrl: string | null;
  readonly photoUrl: string | null;
  readonly height: string | null;
  readonly weight: string | null;
  readonly stats: DomainPlayerStats;
}

export interface DomainSquadByPosition {
  readonly goalkeepers: readonly DomainPlayer[];
  readonly defenders: readonly DomainPlayer[];
  readonly midfielders: readonly DomainPlayer[];
  readonly forwards: readonly DomainPlayer[];
}

export const POSITION_ORDER: Record<DomainPlayerPosition, number> = {
  goalkeeper: 1,
  defender: 2,
  midfielder: 3,
  forward: 4,
};

/**
 * Maps ESPN position name to canonical DomainPlayerPosition.
 *
 * @param espnPositionName Raw position name or abbreviation from external API.
 * @returns Canonical DomainPlayerPosition.
 */
export function mapEspnPosition(espnPositionName?: string | null): DomainPlayerPosition {
  if (!espnPositionName) return "midfielder";
  const lower = espnPositionName.toLowerCase();
  if (lower.includes("goalkeeper") || lower.includes("keeper") || lower === "g") {
    return "goalkeeper";
  }
  if (lower.includes("defen") || lower.includes("back") || lower === "d") {
    return "defender";
  }
  if (
    lower.includes("forward") ||
    lower.includes("striker") ||
    lower.includes("attacker") ||
    lower === "f"
  ) {
    return "forward";
  }
  return "midfielder";
}

/**
 * Returns Spanish label for a tactical player position.
 *
 * @param pos Canonical DomainPlayerPosition.
 * @returns Spanish human-readable position label.
 */
export function mapPositionToLabel(pos: DomainPlayerPosition): string {
  switch (pos) {
    case "goalkeeper":
      return "Portero";
    case "defender":
      return "Defensa";
    case "midfielder":
      return "Centrocampista";
    case "forward":
      return "Delantero";
  }
}

/**
 * Returns short tactical acronym for badge chips (inspired by POR, DFC, MED, DEL).
 *
 * @param pos Canonical DomainPlayerPosition.
 * @returns Short 3-letter acronym.
 */
export function mapPositionToShort(pos: DomainPlayerPosition): string {
  switch (pos) {
    case "goalkeeper":
      return "POR";
    case "defender":
      return "DEF";
    case "midfielder":
      return "MED";
    case "forward":
      return "DEL";
  }
}

/**
 * Groups and sorts a squad of players into tactical sections ordered by shirt number ascending.
 *
 * @param players Array of DomainPlayer items.
 * @returns DomainSquadByPosition object with tactical categories.
 */
export function groupSquadByPosition(
  players: readonly DomainPlayer[]
): DomainSquadByPosition {
  const sortByDorsal = (a: DomainPlayer, b: DomainPlayer) => {
    const numA = a.shirtNumber ?? 999;
    const numB = b.shirtNumber ?? 999;
    return numA - numB;
  };

  const goalkeepers = players
    .filter((p) => p.position === "goalkeeper")
    .sort(sortByDorsal);

  const defenders = players
    .filter((p) => p.position === "defender")
    .sort(sortByDorsal);

  const midfielders = players
    .filter((p) => p.position === "midfielder")
    .sort(sortByDorsal);

  const forwards = players
    .filter((p) => p.position === "forward")
    .sort(sortByDorsal);

  return {
    goalkeepers,
    defenders,
    midfielders,
    forwards,
  };
}

