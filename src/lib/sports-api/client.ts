import {
  apiFootballStandingsResponseSchema,
  apiFootballFixturesResponseSchema,
  transformStandingRow,
  transformFixture,
  LALIGA_HYPERMOTION_LEAGUE_ID,
  SPORTING_GIJON_TEAM_ID,
  getCurrentSeasonYear,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "./types.ts";
import {
  getCachedPayload,
  setCachedPayload,
  TTL_STANDINGS_MS,
  TTL_FIXTURES_MS,
} from "./cache.ts";
import {
  fetchEspnLiveStandings,
  fetchEspnSportingMatch,
  fetchEspnSportingSeasonMatches,
} from "./espn.ts";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Returns configuration credentials for API-Football.
 */
function getApiConfig() {
  const apiKey = process.env.SPORTS_API_KEY;
  const baseUrl = process.env.SPORTS_API_BASE_URL || "https://v3.football.api-sports.io";

  return { apiKey, baseUrl };
}

/**
 * Fetches and validates LaLiga Hypermotion standings, checking Supabase cache first if available.
 * For the active ongoing season, uses the live ESPN connector.
 *
 * @param season The four-digit season year (defaults to active season via getCurrentSeasonYear()).
 * @param supabase Optional scoped Supabase client for cache reads and writes.
 * @returns Array of transformed DomainStandingRow items ordered by position.
 */
export async function fetchStandings(
  season: number = getCurrentSeasonYear(),
  supabase?: SupabaseServerClient | null
): Promise<readonly DomainStandingRow[]> {
  const currentSeason = getCurrentSeasonYear();
  const cacheKey = `standings_${LALIGA_HYPERMOTION_LEAGUE_ID}_${season}`;

  // 1. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainStandingRow[]>(supabase, cacheKey);
    if (cached) {
      return cached;
    }
  }

  // 2. For the active season, use the live open connector
  if (season === currentSeason) {
    try {
      const liveRows = await fetchEspnLiveStandings();
      if (liveRows.length > 0) {
        if (supabase) {
          await setCachedPayload(
            supabase,
            cacheKey,
            liveRows as unknown as Record<string, unknown>[],
            TTL_STANDINGS_MS
          );
        }
        return liveRows;
      }
    } catch {
      // Fall through to API-Football fallback
    }
  }

  // 3. Fallback to API-Football
  const { apiKey, baseUrl } = getApiConfig();
  if (!apiKey) {
    return [];
  }

  const url = `${baseUrl}/standings?league=${LALIGA_HYPERMOTION_LEAGUE_ID}&season=${season}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const json: unknown = await response.json();
  const parsed = apiFootballStandingsResponseSchema.safeParse(json);
  if (!parsed.success) {
    return [];
  }

  const rawRows = parsed.data.response[0]?.league.standings[0] ?? [];
  const domainRows = rawRows.map(transformStandingRow);

  if (supabase && domainRows.length > 0) {
    await setCachedPayload(
      supabase,
      cacheKey,
      domainRows as unknown as Record<string, unknown>[],
      TTL_STANDINGS_MS
    );
  }

  return domainRows;
}

/**
 * Fetches and validates the match for Real Sporting for the current season.
 *
 * @param supabase Optional scoped Supabase client for cache reads and writes.
 * @param teamId Team ID (defaults to Sporting: 731).
 * @returns Match summary or null if no fixture found.
 */
export async function fetchNextFixture(
  supabase?: SupabaseServerClient | null,
  teamId: number = SPORTING_GIJON_TEAM_ID
): Promise<DomainMatchSummary | null> {
  const cacheKey = `fixture_current_${teamId}`;

  // 1. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainMatchSummary>(supabase, cacheKey);
    if (cached) {
      return cached;
    }
  }

  // 2. Try live match schedule from ESPN for 2026/27
  try {
    const liveMatch = await fetchEspnSportingMatch();
    if (liveMatch) {
      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          liveMatch as unknown as Record<string, unknown>,
          TTL_FIXTURES_MS
        );
      }
      return liveMatch;
    }
  } catch {
    // Fall through to API-Football
  }

  // 3. Fallback to API-Football
  const { apiKey, baseUrl } = getApiConfig();
  if (!apiKey) {
    return null;
  }

  const url = `${baseUrl}/fixtures?team=${teamId}&season=2024`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const json: unknown = await response.json();
  const parsed = apiFootballFixturesResponseSchema.safeParse(json);
  if (!parsed.success || parsed.data.response.length === 0) {
    return null;
  }

  const fixtures = parsed.data.response;
  const rawFixture = fixtures[fixtures.length - 1];
  if (!rawFixture) {
    return null;
  }

  const domainMatch = transformFixture(rawFixture);

  if (supabase) {
    await setCachedPayload(
      supabase,
      cacheKey,
      domainMatch as unknown as Record<string, unknown>,
      TTL_FIXTURES_MS
    );
  }

  return domainMatch;
}

/**
 * Fetches the complete list of matches for Real Sporting for the current season.
 *
 * @param supabase Optional scoped Supabase client for cache reads and writes.
 * @returns Array of 42 DomainMatchSummary items ordered chronologically by matchday.
 */
export async function fetchSportingSeasonMatches(
  supabase?: SupabaseServerClient | null
): Promise<readonly DomainMatchSummary[]> {
  const cacheKey = `sporting_season_matches_${SPORTING_GIJON_TEAM_ID}`;

  // 1. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainMatchSummary[]>(supabase, cacheKey);
    if (cached) {
      return cached;
    }
  }

  // 2. Fetch live full season matches from ESPN
  try {
    const matches = await fetchEspnSportingSeasonMatches();
    if (matches.length > 0) {
      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          matches as unknown as Record<string, unknown>[],
          TTL_FIXTURES_MS
        );
      }
      return matches;
    }
  } catch {
    // If live fetch fails, return empty list (no mock data in production)
  }

  return [];
}

