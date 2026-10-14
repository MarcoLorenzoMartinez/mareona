import { z } from "zod";
import type { MatchStatus } from "@/types/database.types";

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

/**
 * Resolves the starting year of the active football season based on calendar date.
 * European competitions run from July/August to May/June.
 * Months July-December (month index >= 6) belong to season `year`.
 * Months January-June (month index < 6) belong to season `year - 1`.
 *
 * @param date Reference date (defaults to current date).
 * @returns 4-digit starting year of the football season.
 */
export function getCurrentSeasonYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month >= 6 ? year : year - 1;
}

/**
 * Returns the standard formatted label for a season (e.g. "2026/27").
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

export interface DomainMatchDetail {
  readonly externalId: string;
  readonly competition: string;
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
}

// =====================================================================
// ZOD SCHEMAS: ESPN Match Summary
// =====================================================================

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

