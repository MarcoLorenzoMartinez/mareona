import { z } from "zod";
import type {
  DomainStandingRow,
  DomainStandingSplit,
  DomainMatchSummary,
  DomainMatchDetail,
} from "./types.ts";
import {
  normalizeTeamName,
  getSeasonLabel,
  espnMatchSummaryResponseSchema,
  transformEspnMatchDetail,
} from "./types.ts";

export const ESPN_SPORTING_GIJON_ID = "3788";
export const ESPN_SEGUNDA_LEAGUE_SLUG = "esp.2";

// =====================================================================
// ZOD SCHEMAS: ESPN Standings
// =====================================================================

export const espnStatItemSchema = z.object({
  name: z.string(),
  value: z.number().optional().default(0),
});

export const espnStandingEntrySchema = z.object({
  team: z.object({
    id: z.string(),
    displayName: z.string(),
    abbreviation: z.string().optional(),
    logos: z
      .array(
        z.object({
          href: z.string(),
        })
      )
      .optional(),
  }),
  stats: z.array(espnStatItemSchema).optional().default([]),
});

export const espnStandingsResponseSchema = z.object({
  name: z.string().optional(),
  children: z.array(
    z.object({
      standings: z.object({
        entries: z.array(espnStandingEntrySchema),
      }),
    })
  ),
});

export type EspnStandingEntry = z.infer<typeof espnStandingEntrySchema>;

// =====================================================================
// ZOD SCHEMAS: ESPN Scoreboard / Events
// =====================================================================

export interface EspnEventCompetitor {
  readonly id: string;
  readonly homeAway: "home" | "away";
  readonly score?: string | { value?: number };
  readonly team: {
    readonly id: string;
    readonly displayName: string;
    readonly abbreviation?: string;
    readonly logo?: string;
    readonly logos?: readonly { readonly href: string }[];
  };
}

export interface EspnEvent {
  readonly id: string;
  readonly date: string;
  readonly name: string;
  readonly timeValid?: boolean;
  readonly competitions: readonly [
    {
      readonly id: string;
      readonly status: {
        readonly type: {
          readonly state: string;
          readonly description?: string;
          readonly detail?: string;
          readonly shortDetail?: string;
        };
      };
      readonly venue?: {
        readonly fullName?: string;
      };
      readonly competitors: readonly EspnEventCompetitor[];
    },
  ];
}

// =====================================================================
// TRANSFORMERS
// =====================================================================

function getStatValue(stats: readonly { name: string; value: number }[], statName: string): number {
  const stat = stats.find((s) => s.name === statName);
  return stat ? stat.value : 0;
}

/**
 * Transforms an ESPN standings entry into a clean domain row model.
 */
export function transformEspnStandingEntry(entry: EspnStandingEntry): DomainStandingRow {
  const stats = entry.stats;
  const teamId = entry.team.id;
  const isSporting =
    teamId === ESPN_SPORTING_GIJON_ID ||
    entry.team.abbreviation === "RSG" ||
    entry.team.displayName.toLowerCase().includes("sporting");

  return {
    position: getStatValue(stats, "rank"),
    teamExternalId: teamId,
    teamName: normalizeTeamName(entry.team.displayName, isSporting),
    crestUrl: entry.team.logos?.[0]?.href ?? null,
    played: getStatValue(stats, "gamesPlayed"),
    won: getStatValue(stats, "wins"),
    drawn: getStatValue(stats, "ties"),
    lost: getStatValue(stats, "losses"),
    goalsFor: getStatValue(stats, "pointsFor"),
    goalsAgainst: getStatValue(stats, "pointsAgainst"),
    points: getStatValue(stats, "points"),
    isSporting,
  };
}

/**
 * Transforms an ESPN event into a clean DomainMatchSummary.
 */
export function transformEspnEvent(event: EspnEvent, matchday: number = 10): DomainMatchSummary | null {
  const comp = event.competitions[0];
  if (!comp) {
    return null;
  }

  const homeComp = comp.competitors.find((c) => c.homeAway === "home");
  const awayComp = comp.competitors.find((c) => c.homeAway === "away");

  if (!homeComp || !awayComp) {
    return null;
  }

  const isHomeSporting =
    homeComp.team.id === ESPN_SPORTING_GIJON_ID ||
    homeComp.team.displayName.toLowerCase().includes("sporting");
  const isAwaySporting =
    awayComp.team.id === ESPN_SPORTING_GIJON_ID ||
    awayComp.team.displayName.toLowerCase().includes("sporting");

  const parseScore = (scoreVal: string | { value?: number } | undefined): number | null => {
    if (scoreVal === undefined) return null;
    if (typeof scoreVal === "object") return scoreVal.value ?? null;
    const n = parseInt(scoreVal, 10);
    return isNaN(n) ? null : n;
  };

  const homeLogo = homeComp.team.logo ?? homeComp.team.logos?.[0]?.href ?? null;
  const awayLogo = awayComp.team.logo ?? awayComp.team.logos?.[0]?.href ?? null;

  const isFinished = comp.status.type.state === "post";
  const homeScore = isFinished ? parseScore(homeComp.score) : null;
  const awayScore = isFinished ? parseScore(awayComp.score) : null;

  return {
    externalId: event.id,
    competition: "LaLiga Hypermotion",
    season: getSeasonLabel(),
    matchday,
    kickoffAt: event.date,
    status: isFinished ? "finished" : "scheduled",
    venue: comp.venue?.fullName ?? "El Molinón",
    isTimeConfirmed:
      event.timeValid !== false &&
      comp.status.type.shortDetail?.toUpperCase() !== "TBD" &&
      !comp.status.type.detail?.toUpperCase().includes("TBD") &&
      !comp.status.type.description?.toUpperCase().includes("TBD"),
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

// =====================================================================
// FETCHER METHODS
// =====================================================================

/**
 * Fetches the live 2026/27 season standings directly from ESPN open API.
 */
export async function fetchEspnLiveStandings(
  options?: { includeSplits?: boolean }
): Promise<readonly DomainStandingRow[]> {
  const url = `https://site.api.espn.com/apis/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/standings`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mareona/1.0",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
  }

  const json: unknown = await response.json();
  const parsed = espnStandingsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Invalid ESPN standings format: ${parsed.error.message}`);
  }

  const entries = parsed.data.children[0]?.standings.entries ?? [];
  const baseRows = entries.map(transformEspnStandingEntry);

  // If splits (home/away) are not requested, return baseRows immediately.
  // This eliminates 22 concurrent HTTP requests on views where splits are unused.
  if (!options?.includeSplits) {
    return baseRows;
  }

  try {
    const splits = await Promise.all(
      baseRows.map((r) => fetchTeamSplitRecord(r.teamExternalId))
    );

    return baseRows.map((row, index) => ({
      ...row,
      home: splits[index]?.home,
      away: splits[index]?.away,
    }));
  } catch {
    // If team split enrichment fails, return base rows without breaking standings view
    return baseRows;
  }
}

/**
 * Fetches verified home and away split record for a team from ESPN API.
 */
async function fetchTeamSplitRecord(
  teamId: string
): Promise<{ home?: DomainStandingSplit; away?: DomainStandingSplit }> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/teams/${teamId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mareona/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {};
    }

    const data = (await res.json()) as {
      team?: {
        record?: {
          items?: Array<{
            stats?: Array<{ name: string; value: number }>;
          }>;
        };
      };
    };

    const stats = data.team?.record?.items?.[0]?.stats ?? [];
    const getVal = (name: string): number => stats.find((s) => s.name === name)?.value ?? 0;

    const homeWins = getVal("homeWins");
    const homeTies = getVal("homeTies");
    const homeLosses = getVal("homeLosses");
    const homeGamesPlayed = getVal("homeGamesPlayed") || homeWins + homeTies + homeLosses;
    const homeGoalsFor = getVal("homePointsFor");
    const homeGoalsAgainst = getVal("homePointsAgainst");
    const homePoints = homeWins * 3 + homeTies;

    const awayWins = getVal("awayWins");
    const awayTies = getVal("awayTies");
    const awayLosses = getVal("awayLosses");
    const awayGamesPlayed = getVal("awayGamesPlayed") || awayWins + awayTies + awayLosses;
    const awayGoalsFor = getVal("awayPointsFor");
    const awayGoalsAgainst = getVal("awayPointsAgainst");
    const awayPoints = awayWins * 3 + awayTies;

    return {
      home: {
        played: homeGamesPlayed,
        won: homeWins,
        drawn: homeTies,
        lost: homeLosses,
        goalsFor: homeGoalsFor,
        goalsAgainst: homeGoalsAgainst,
        points: homePoints,
      },
      away: {
        played: awayGamesPlayed,
        won: awayWins,
        drawn: awayTies,
        lost: awayLosses,
        goalsFor: awayGoalsFor,
        goalsAgainst: awayGoalsAgainst,
        points: awayPoints,
      },
    };
  } catch {
    return {};
  }
}

/**
 * Fetches the upcoming match (or latest played match) for Real Sporting for 2026/27
 * via direct query to the Sporting schedule endpoints (single roundtrip).
 */
export async function fetchEspnSportingMatch(): Promise<DomainMatchSummary | null> {
  const baseUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/teams/${ESPN_SPORTING_GIJON_ID}/schedule`;

  try {
    const [fixtureRes, pastRes] = await Promise.allSettled([
      fetch(`${baseUrl}?fixture=true`, {
        method: "GET",
        headers: { "User-Agent": "Mareona/1.0" },
        next: { revalidate: 3600 },
      }),
      fetch(baseUrl, {
        method: "GET",
        headers: { "User-Agent": "Mareona/1.0" },
        next: { revalidate: 3600 },
      }),
    ]);

    let pastCount = 9;
    if (pastRes.status === "fulfilled" && pastRes.value.ok) {
      const pastData = (await pastRes.value.json()) as { events?: EspnEvent[] };
      if (pastData.events) {
        pastCount = pastData.events.length;
      }
    }

    // 1. Check for upcoming fixture first
    if (fixtureRes.status === "fulfilled" && fixtureRes.value.ok) {
      const fixtureData = (await fixtureRes.value.json()) as { events?: EspnEvent[] };
      const upcomingEvent = fixtureData.events?.[0];
      if (upcomingEvent) {
        return transformEspnEvent(upcomingEvent, pastCount + 1);
      }
    }

    // 2. If no upcoming fixture found, return latest played match
    if (pastRes.status === "fulfilled" && pastRes.value.ok) {
      const pastData = (await pastRes.value.json()) as { events?: EspnEvent[] };
      const recentEvent = pastData.events?.[0];
      if (recentEvent) {
        return transformEspnEvent(recentEvent, pastCount);
      }
    }
  } catch {
    // Fall through
  }

  return null;
}

/**
 * Fetches the full season list of matches for Real Sporting from ESPN,
 * combining completed matches (schedule) and upcoming fixtures (schedule?fixture=true).
 *
 * @returns Array of DomainMatchSummary items ordered by matchday from Jornada 1 to 42.
 */
export async function fetchEspnSportingSeasonMatches(): Promise<readonly DomainMatchSummary[]> {
  const baseUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/teams/${ESPN_SPORTING_GIJON_ID}/schedule`;

  const [pastRes, upcomingRes] = await Promise.allSettled([
    fetch(baseUrl, {
      method: "GET",
      headers: { "User-Agent": "Mareona/1.0" },
      next: { revalidate: 3600 },
    }),
    fetch(`${baseUrl}?fixture=true`, {
      method: "GET",
      headers: { "User-Agent": "Mareona/1.0" },
      next: { revalidate: 3600 },
    }),
  ]);

  const pastEvents: EspnEvent[] = [];
  const upcomingEvents: EspnEvent[] = [];

  if (pastRes.status === "fulfilled" && pastRes.value.ok) {
    const pastData = (await pastRes.value.json()) as { events?: EspnEvent[] };
    if (pastData.events) {
      // Past events are delivered reverse-chronological by ESPN (Jornada 9 down to Jornada 1)
      pastEvents.push(...[...pastData.events].reverse());
    }
  }

  if (upcomingRes.status === "fulfilled" && upcomingRes.value.ok) {
    const upcomingData = (await upcomingRes.value.json()) as { events?: EspnEvent[] };
    if (upcomingData.events) {
      upcomingEvents.push(...upcomingData.events);
    }
  }

  const allEvents = [...pastEvents, ...upcomingEvents];
  const domainMatches: DomainMatchSummary[] = [];

  for (let i = 0; i < allEvents.length; i++) {
    const ev = allEvents[i];
    if (!ev) continue;
    const matchday = i + 1;
    const match = transformEspnEvent(ev, matchday);
    if (match) {
      domainMatches.push(match);
    }
  }

  return domainMatches;
}

/**
 * Fetches match details from ESPN summary API.
 *
 * @param matchId ESPN event identifier.
 * @param matchday Optional known matchday number (Jornada).
 * @returns Clean DomainMatchDetail or null if event is not found or invalid.
 */
export async function fetchEspnMatchDetail(
  matchId: string,
  matchday?: number | null
): Promise<DomainMatchDetail | null> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/summary?event=${matchId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mareona/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const json: unknown = await res.json();
    const parsed = espnMatchSummaryResponseSchema.safeParse(json);
    if (!parsed.success) {
      return null;
    }

    return transformEspnMatchDetail(parsed.data, matchday ?? null);
  } catch {
    return null;
  }
}


