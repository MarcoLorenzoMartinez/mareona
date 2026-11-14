import {
  apiFootballStandingsResponseSchema,
  apiFootballFixturesResponseSchema,
  transformStandingRow,
  transformFixture,
  LALIGA_HYPERMOTION_LEAGUE_ID,
  SPORTING_GIJON_TEAM_ID,
  getCurrentSeasonYear,
  normalizeAthleteName,
  type DomainStandingRow,
  type DomainMatchSummary,
  type DomainMatchDetail,
  type DomainMatchLineup,
  type DomainPlayer,
} from "./types.ts";
import {
  getCachedPayload,
  setCachedPayload,
  TTL_STANDINGS_MS,
  TTL_FIXTURES_MS,
  TTL_LIVE_MATCH_MS,
  TTL_SQUAD_MS,
  resolveMatchDetailTtlMs,
} from "./cache.ts";
import { PRE_MATCH_POLL_WINDOW_MS } from "./live-poll.ts";
import {
  fetchEspnLiveStandings,
  fetchEspnSportingMatch,
  fetchEspnSportingSeasonMatches,
  fetchEspnMatchDetail,
  fetchEspnSportingRoster,
} from "./espn.ts";
import { fetchFotMobAdvancedStats } from "./fotmob.ts";
import { fetchSportingCopaMatches } from "./copa.ts";
import { fetchFotMobMatchDetail } from "./fotmob-match-detail.ts";
import { triggerCardSyncForFinishedMatch } from "../cards/card-catalog-sync.ts";
import type { createClient } from "@/lib/supabase/server";
import { createLogger } from "../logger/core.ts";

const sportsLog = createLogger({ context: "sports-api" });

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Returns configuration credentials for API-Football.
 */
function getApiConfig() {
  const apiKey = process.env.SPORTS_API_KEY;
  const baseUrl = process.env.SPORTS_API_BASE_URL || "https://v3.football.api-sports.io";

  return { apiKey, baseUrl };
}

const memoryCachedStandings = new Map<
  string,
  { data: readonly DomainStandingRow[]; expiresAt: number }
>();

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
  supabase?: SupabaseServerClient | null,
  options?: { includeSplits?: boolean }
): Promise<readonly DomainStandingRow[]> {
  const currentSeason = getCurrentSeasonYear();
  const includeSplits = options?.includeSplits ?? false;
  const memoryKey = `${season}_${includeSplits}`;
  const now = Date.now();

  const memoryHit = memoryCachedStandings.get(memoryKey);
  if (memoryHit && memoryHit.expiresAt > now && memoryHit.data.length > 0) {
    return memoryHit.data;
  }

  const cacheKey = `standings_${LALIGA_HYPERMOTION_LEAGUE_ID}_${season}${includeSplits ? "_splits" : ""}`;

  // 1. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainStandingRow[]>(supabase, cacheKey);
    if (cached) {
      memoryCachedStandings.set(memoryKey, {
        data: cached,
        expiresAt: now + TTL_STANDINGS_MS,
      });
      return cached;
    }
  }

  // 2. For the active season, use the live open connector
  if (season === currentSeason) {
    try {
      const liveRows = await fetchEspnLiveStandings({ includeSplits });
      if (liveRows.length > 0) {
        memoryCachedStandings.set(memoryKey, {
          data: liveRows,
          expiresAt: now + TTL_STANDINGS_MS,
        });

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
    } catch (err) {
      sportsLog.warn("ESPN live standings request failed, falling back to API-Football", { season }, err);
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

/** In-memory cache for next fixture to eliminate hero card latency. */
let memoryCachedNextFixture: {
  teamId: number;
  data: DomainMatchSummary | null;
  expiresAt: number;
} | null = null;

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
  const now = Date.now();
  if (
    memoryCachedNextFixture &&
    memoryCachedNextFixture.teamId === teamId &&
    memoryCachedNextFixture.expiresAt > now
  ) {
    return memoryCachedNextFixture.data;
  }

  const cacheKey = `fixture_current_${teamId}`;

  // 1. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainMatchSummary>(supabase, cacheKey);
    if (cached) {
      const isNearOrPastKickoff =
        cached.status === "scheduled" &&
        new Date(cached.kickoffAt).getTime() - now <= PRE_MATCH_POLL_WINDOW_MS;
      if (isNearOrPastKickoff) {
        // Cache is stale! The match should be starting or in progress. Re-fetch fresh.
      } else {
        const ttl = resolveMatchDetailTtlMs(cached.status, cached.kickoffAt, now);
        memoryCachedNextFixture = {
          teamId,
          data: cached,
          expiresAt: now + ttl,
        };
        return cached;
      }
    }
  }

  // 2. Try live upcoming fixture from full schedule (unifies League and Copa del Rey)
  try {
    const seasonMatches = await fetchSportingSeasonMatches(supabase);
    const upcoming = seasonMatches.filter((m) => m.status !== "finished");
    const nextChronological = upcoming.length > 0 ? upcoming[0] : null;

    if (nextChronological) {
      const ttl = resolveMatchDetailTtlMs(nextChronological.status, nextChronological.kickoffAt, now);
      memoryCachedNextFixture = {
        teamId,
        data: nextChronological,
        expiresAt: now + ttl,
      };

      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          nextChronological as unknown as Record<string, unknown>,
          ttl
        );
      }
      return nextChronological;
    }

    const liveMatch = await fetchEspnSportingMatch();
    if (liveMatch) {
      const ttl = resolveMatchDetailTtlMs(liveMatch.status, liveMatch.kickoffAt, now);
      memoryCachedNextFixture = {
        teamId,
        data: liveMatch,
        expiresAt: now + ttl,
      };

      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          liveMatch as unknown as Record<string, unknown>,
          ttl
        );
      }
      return liveMatch;
    }
  } catch (err) {
    sportsLog.warn("ESPN live match detail request failed, falling back to API-Football", { teamId }, err);
  }

  // 3. Fallback to API-Football
  const { apiKey, baseUrl } = getApiConfig();
  if (!apiKey) {
    return null;
  }

  const currentSeason = getCurrentSeasonYear();
  const url = `${baseUrl}/fixtures?team=${teamId}&season=${currentSeason}`;
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

/** In-memory cache for season matches to eliminate navigation delays. */
let memoryCachedSeasonMatches: {
  data: readonly DomainMatchSummary[];
  expiresAt: number;
} | null = null;

/**
 * Fetches the complete list of matches for Real Sporting for the current season.
 *
 * @param supabase Optional scoped Supabase client for cache reads and writes.
 * @returns Array of 42 DomainMatchSummary items ordered chronologically by matchday.
 */
export async function fetchSportingSeasonMatches(
  supabase?: SupabaseServerClient | null
): Promise<readonly DomainMatchSummary[]> {
  const now = Date.now();
  if (
    memoryCachedSeasonMatches &&
    memoryCachedSeasonMatches.expiresAt > now &&
    memoryCachedSeasonMatches.data.length > 0
  ) {
    return memoryCachedSeasonMatches.data;
  }

  const cacheKey = `sporting_season_matches_${SPORTING_GIJON_TEAM_ID}`;

  // 1. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainMatchSummary[]>(supabase, cacheKey);
    if (cached) {
      const hasStaleScheduled = cached.some(
        (m) =>
          m.status === "scheduled" &&
          new Date(m.kickoffAt).getTime() - now <= PRE_MATCH_POLL_WINDOW_MS
      );
      if (hasStaleScheduled) {
        // A scheduled match has entered the kickoff window; re-fetch from vendor to detect live kickoff
      } else {
        const hasLive = cached.some((m) => m.status === "live");
        const ttl = hasLive ? TTL_LIVE_MATCH_MS : TTL_FIXTURES_MS;
        memoryCachedSeasonMatches = {
          data: cached,
          expiresAt: now + ttl,
        };
        return cached;
      }
    }
  }

  // 2. Fetch live full season matches from ESPN (League) and FotMob (Copa del Rey)
  try {
    const [leagueMatches, copaMatches] = await Promise.all([
      fetchEspnSportingSeasonMatches(),
      fetchSportingCopaMatches(),
    ]);

    const matches = [...leagueMatches, ...copaMatches].sort(
      (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    );

    if (matches.length > 0) {
      const hasLive = matches.some((m) => m.status === "live");
      const ttl = hasLive ? TTL_LIVE_MATCH_MS : TTL_FIXTURES_MS;
      memoryCachedSeasonMatches = {
        data: matches,
        expiresAt: now + ttl,
      };

      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          matches as unknown as Record<string, unknown>[],
          ttl
        );
      }
      return matches;
    }
  } catch {
    // If live fetch fails, return empty list (no mock data in production)
  }

  return [];
}

/**
 * Fetches match details for a specific match, checking Supabase cache first if available.
 * Resolves matchday from season matches if not known.
 *
 * @param matchId ESPN match event ID.
 * @param supabase Optional scoped Supabase client for cache reads and writes.
 * @returns DomainMatchDetail or null if not found.
 */
function sanitizeMatchDetail(detail: DomainMatchDetail): DomainMatchDetail {
  const sanitizeLineup = (lineup: DomainMatchLineup | null) => {
    if (!lineup) return null;
    return {
      ...lineup,
      starters: lineup.starters.map((p) => {
        const norm = normalizeAthleteName({ id: p.id, displayName: p.name, shortName: p.shortName });
        const photoUrl = p.photoUrl ?? (lineup.isSporting && p.jersey ? `/images/players/${p.jersey}.png` : null);
        return { ...p, name: norm.name, shortName: norm.shortName, photoUrl };
      }),
      substitutes: lineup.substitutes.map((p) => {
        const norm = normalizeAthleteName({ id: p.id, displayName: p.name, shortName: p.shortName });
        const photoUrl = p.photoUrl ?? (lineup.isSporting && p.jersey ? `/images/players/${p.jersey}.png` : null);
        return { ...p, name: norm.name, shortName: norm.shortName, photoUrl };
      }),
    };
  };

  const assists = detail.advancedStats?.goalAssists ?? [];

  return {
    ...detail,
    homeLineup: sanitizeLineup(detail.homeLineup),
    awayLineup: sanitizeLineup(detail.awayLineup),
    events: (() => {
      let runningHome = 0;
      let runningAway = 0;
      return detail.events.map((e) => {
        const pNorm = normalizeAthleteName({ id: e.player.id, displayName: e.player.name });
        let secNorm = e.secondaryPlayer
          ? normalizeAthleteName({ id: e.secondaryPlayer.id, displayName: e.secondaryPlayer.name })
          : undefined;

        if (e.type === "goal" && !secNorm && assists.length > 0) {
          const rawMin = e.minute.split("+")[0] ?? "";
          const eventMin = parseInt(rawMin.replace(/\D/g, ""), 10);
          const pLower = pNorm.name.toLowerCase();

          const found = assists.find((a) => {
            const aScorer = a.scorerName.toLowerCase();
            const minDiff = Number.isNaN(eventMin) ? 0 : Math.abs(eventMin - a.minute);
            const matchesScorer =
              pLower.includes(aScorer) ||
              aScorer.includes(pLower) ||
              pLower.split(" ").some((part) => part.length > 2 && aScorer.includes(part));
            return minDiff <= 3 && matchesScorer;
          });

          if (found?.assistantName) {
            secNorm = { name: found.assistantName, shortName: found.assistantName };
          }
        }

        let score = e.score;
        if (e.type === "goal") {
          if (e.isHome) {
            runningHome += 1;
          } else {
            runningAway += 1;
          }
          score = score ?? `${runningHome} - ${runningAway}`;
        }
        return {
          ...e,
          score,
          player: { ...e.player, name: pNorm.name },
          secondaryPlayer: secNorm
            ? { id: e.secondaryPlayer?.id ?? "", name: secNorm.name }
            : undefined,
        };
      });
    })(),
  };
}

/** In-memory cache for match details to eliminate latency and duplicate calls. */
const memoryCachedMatchDetails = new Map<
  string,
  { data: DomainMatchDetail; expiresAt: number }
>();

export async function fetchMatchDetail(
  matchId: string,
  supabase?: SupabaseServerClient | null
): Promise<DomainMatchDetail | null> {
  const now = Date.now();

  // 1. Instant in-memory cache check (0ms response)
  const memoryHit = memoryCachedMatchDetails.get(matchId);
  if (memoryHit && memoryHit.expiresAt > now) {
    return memoryHit.data;
  }

  const cacheKey = `match_detail_${matchId}`;

  // 2. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainMatchDetail>(supabase, cacheKey);
    if (cached) {
      if (cached.advancedStats === undefined && cached.status === "finished") {
        try {
          const advanced = await fetchFotMobAdvancedStats(
            cached.kickoffAt,
            cached.homeTeam.name,
            cached.awayTeam.name
          );
          if (advanced) {
            const enriched = { ...cached, advancedStats: advanced };
            await setCachedPayload(
              supabase,
              cacheKey,
              enriched as unknown as Record<string, unknown>,
              TTL_FIXTURES_MS
            );
            const sanitized = sanitizeMatchDetail(enriched);
            memoryCachedMatchDetails.set(matchId, {
              data: sanitized,
              expiresAt: now + resolveMatchDetailTtlMs(sanitized.status),
            });
            return sanitized;
          }
        } catch {
          // Fall through to returning cached
        }
      }
      const sanitized = sanitizeMatchDetail(cached);
      memoryCachedMatchDetails.set(matchId, {
        data: sanitized,
        expiresAt: now + resolveMatchDetailTtlMs(sanitized.status),
      });
      return sanitized;
    }
  }

  // 2. Resolve matchday from season matches
  let matchday: number | null = null;
  let isTimeConfirmedFromSeason: boolean | undefined = undefined;
  try {
    const seasonMatches = await fetchSportingSeasonMatches(supabase);
    const found = seasonMatches.find((m) => m.externalId === matchId);
    if (found?.matchday) {
      matchday = found.matchday;
    }
    if (found?.isTimeConfirmed !== undefined) {
      isTimeConfirmedFromSeason = found.isTimeConfirmed;
    }
  } catch {
    // If season match resolution fails, continue with null matchday
  }

  // 3. Fetch live match details from ESPN
  try {
    const detail = await fetchEspnMatchDetail(matchId, matchday);
    if (detail) {
      let advancedStats = null;
      try {
        advancedStats = await fetchFotMobAdvancedStats(
          detail.kickoffAt,
          detail.homeTeam.name,
          detail.awayTeam.name
        );
      } catch {
        // Fallback gracefully
      }

      const finalDetail: DomainMatchDetail = {
        ...(isTimeConfirmedFromSeason === false ? { ...detail, isTimeConfirmed: false } : detail),
        advancedStats,
      };

      const sanitized = sanitizeMatchDetail(finalDetail);
      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          sanitized as unknown as Record<string, unknown>,
          resolveMatchDetailTtlMs(sanitized.status)
        );
        if (sanitized.status === "finished") {
          void triggerCardSyncForFinishedMatch(supabase, sanitized);
        }
      }
      memoryCachedMatchDetails.set(matchId, {
        data: sanitized,
        expiresAt: now + resolveMatchDetailTtlMs(sanitized.status),
      });
      return sanitized;
    }

    // 4. If ESPN does not have this match (e.g. Copa del Rey), fallback to FotMob
    const fotmobDetail = await fetchFotMobMatchDetail(matchId);
    if (fotmobDetail) {
      const sanitized = sanitizeMatchDetail(fotmobDetail);
      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          sanitized as unknown as Record<string, unknown>,
          resolveMatchDetailTtlMs(sanitized.status)
        );
        if (sanitized.status === "finished") {
          void triggerCardSyncForFinishedMatch(supabase, sanitized);
        }
      }
      memoryCachedMatchDetails.set(matchId, {
        data: sanitized,
        expiresAt: now + resolveMatchDetailTtlMs(sanitized.status),
      });
      return sanitized;
    }
  } catch {
    // Return null transparently without fake data
  }

  return null;
}

/** In-memory cache for squad to eliminate latency on tab navigation. */
let memoryCachedSquad: {
  season: number;
  data: readonly DomainPlayer[];
  expiresAt: number;
} | null = null;

/**
 * Fetches the Sporting Gijon squad players, checking in-memory and Supabase cache.
 * Uses the live open ESPN connector for the active season.
 *
 * @param supabase Optional scoped Supabase server client for cache reads and writes.
 * @returns Array of DomainPlayer items.
 */
export async function fetchSportingSquad(
  supabase?: SupabaseServerClient | null
): Promise<readonly DomainPlayer[]> {
  const currentSeason = getCurrentSeasonYear();
  const now = Date.now();

  // 1. Instant in-memory cache check (0ms response)
  if (
    memoryCachedSquad &&
    memoryCachedSquad.season === currentSeason &&
    memoryCachedSquad.expiresAt > now &&
    memoryCachedSquad.data.length > 0
  ) {
    return memoryCachedSquad.data;
  }

  const cacheKey = `squad_sporting_${currentSeason}`;

  // 2. Try reading valid cache from Supabase if client is supplied
  if (supabase) {
    const cached = await getCachedPayload<DomainPlayer[]>(supabase, cacheKey);
    if (cached && cached.length > 0) {
      memoryCachedSquad = {
        season: currentSeason,
        data: cached,
        expiresAt: now + TTL_SQUAD_MS,
      };
      return cached;
    }
  }

  // 3. Fetch live from ESPN open connector
  try {
    const livePlayers = await fetchEspnSportingRoster();
    if (livePlayers.length > 0) {
      memoryCachedSquad = {
        season: currentSeason,
        data: livePlayers,
        expiresAt: now + TTL_SQUAD_MS,
      };

      if (supabase) {
        await setCachedPayload(
          supabase,
          cacheKey,
          livePlayers as unknown as Record<string, unknown>[],
          TTL_SQUAD_MS
        );
      }
      return livePlayers;
    }
  } catch {
    // Return empty array transparently without mock data
  }

  return [];
}


