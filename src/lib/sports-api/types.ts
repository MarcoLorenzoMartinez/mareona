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
    competition: item.league.name,
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
