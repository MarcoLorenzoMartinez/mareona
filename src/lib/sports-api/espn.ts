import { z } from "zod";
import type { DomainStandingRow, DomainMatchSummary } from "./types.ts";
import { normalizeTeamName, getSeasonLabel } from "./types.ts";

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
  readonly competitions: readonly [
    {
      readonly id: string;
      readonly status: {
        readonly type: {
          readonly state: string;
          readonly description?: string;
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
export async function fetchEspnLiveStandings(): Promise<readonly DomainStandingRow[]> {
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
  return entries.map(transformEspnStandingEntry);
}

/**
 * Fetches the upcoming match (or latest played match) for Real Sporting for 2026/27.
 */
export async function fetchEspnSportingMatch(): Promise<DomainMatchSummary | null> {
  // 1. Fetch current scoreboard to get upcoming calendar dates
  try {
    const sbUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/scoreboard`;
    const sbRes = await fetch(sbUrl, {
      method: "GET",
      headers: { "User-Agent": "Mareona/1.0" },
      next: { revalidate: 3600 },
    });

    if (sbRes.ok) {
      const sbData = (await sbRes.json()) as {
        leagues?: Array<{ calendar?: string[] }>;
      };

      const calendar = sbData.leagues?.[0]?.calendar ?? [];
      const now = new Date();
      // Filter dates starting from today onwards, inspecting up to 5 upcoming dates
      const upcomingDates = calendar
        .filter((dt) => new Date(dt) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        .slice(0, 5);

      for (const calDate of upcomingDates) {
        const dayStr = calDate.slice(0, 10).replace(/-/g, "");
        const dayRes = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/scoreboard?dates=${dayStr}`,
          {
            method: "GET",
            headers: { "User-Agent": "Mareona/1.0" },
            next: { revalidate: 3600 },
          }
        );

        if (dayRes.ok) {
          const dayData = (await dayRes.json()) as { events?: EspnEvent[] };
          const sportingEvent = dayData.events?.find((e) =>
            e.competitions[0]?.competitors.some((c) => c.team.id === ESPN_SPORTING_GIJON_ID)
          );

          if (sportingEvent) {
            // Next scheduled match is Jornada 10
            return transformEspnEvent(sportingEvent, 10);
          }
        }
      }
    }
  } catch {
    // If scoreboard fails, fall through to team schedule
  }

  // 2. Fallback: Query team schedule (events array is sorted reverse chronological: index 0 is most recent!)
  try {
    const scheduleUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/teams/${ESPN_SPORTING_GIJON_ID}/schedule`;
    const schedRes = await fetch(scheduleUrl, {
      method: "GET",
      headers: { "User-Agent": "Mareona/1.0" },
      next: { revalidate: 3600 },
    });

    if (schedRes.ok) {
      const schedData = (await schedRes.json()) as { events?: EspnEvent[] };
      const events = schedData.events;
      if (events && events.length > 0) {
        // events[0] is the most recent match (Jornada 9)
        const recentEvent = events[0];
        if (recentEvent) {
          return transformEspnEvent(recentEvent, 9);
        }
      }
    }
  } catch {
    // Fall through
  }

  return null;
}
