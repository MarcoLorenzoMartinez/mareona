import { z } from "zod";
import type {
  DomainStandingRow,
  DomainStandingSplit,
  DomainMatchSummary,
  DomainMatchDetail,
  DomainPlayer,
  MatchStatus,
} from "./types.ts";
import {
  normalizeTeamName,
  getSeasonLabel,
  espnMatchSummaryResponseSchema,
  transformEspnMatchDetail,
  POSITION_ORDER,
  mapEspnPosition,
  mapPositionToLabel,
  mapPositionToShort,
} from "./types.ts";

export const ESPN_SPORTING_GIJON_ID = "3788";
export const ESPN_SEGUNDA_LEAGUE_SLUG = "esp.2";

const ESPN_REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
};

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
  const isLive = comp.status.type.state === "in";
  const status: MatchStatus = isFinished ? "finished" : isLive ? "live" : "scheduled";
  const homeScore = isFinished || isLive ? parseScore(homeComp.score) : null;
  const awayScore = isFinished || isLive ? parseScore(awayComp.score) : null;

  return {
    externalId: event.id,
    competition: "LaLiga Hypermotion",
    season: getSeasonLabel(),
    matchday,
    kickoffAt: event.date,
    status,
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
    headers: ESPN_REQUEST_HEADERS,
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
      headers: ESPN_REQUEST_HEADERS,
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
        headers: ESPN_REQUEST_HEADERS,
        next: { revalidate: 3600 },
      }),
      fetch(baseUrl, {
        method: "GET",
        headers: ESPN_REQUEST_HEADERS,
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
      headers: ESPN_REQUEST_HEADERS,
      next: { revalidate: 3600 },
    }),
    fetch(`${baseUrl}?fixture=true`, {
      method: "GET",
      headers: ESPN_REQUEST_HEADERS,
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
      headers: ESPN_REQUEST_HEADERS,
      next: { revalidate: 15 },
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

// =====================================================================
// ZOD SCHEMAS: ESPN Roster
// =====================================================================

export const espnAthleteSchema = z.object({
  id: z.string(),
  fullName: z.string().optional().default(""),
  displayName: z.string().optional().default(""),
  shortName: z.string().optional().default(""),
  jersey: z.string().optional().default(""),
  age: z.number().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  citizenship: z.string().optional().nullable(),
  displayHeight: z.string().optional().nullable(),
  displayWeight: z.string().optional().nullable(),
  flag: z
    .object({
      href: z.string().optional(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  headshot: z
    .object({
      href: z.string().optional(),
    })
    .optional()
    .nullable(),
  position: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      displayName: z.string().optional(),
      abbreviation: z.string().optional(),
    })
    .optional()
    .nullable(),
  statistics: z
    .object({
      splits: z
        .object({
          categories: z
            .array(
              z.object({
                name: z.string().optional(),
                stats: z
                  .array(
                    z.object({
                      name: z.string(),
                      value: z.number().optional().default(0),
                    })
                  )
                  .optional()
                  .default([]),
              })
            )
            .optional()
            .default([]),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export const espnRosterResponseSchema = z.object({
  status: z.string().optional(),
  athletes: z.array(espnAthleteSchema).optional().default([]),
});

export type EspnAthlete = z.infer<typeof espnAthleteSchema>;

/**
 * Canonical overrides for known third-party API provider errors.
 * Example: ESPN's database misattributes Sporting canterano Nacho Martín (jersey #6, born 2002)
 * as veteran forward Nacho Martínez (born 1989).
 */
const ATHLETE_CANONICAL_OVERRIDES: Record<string, Partial<DomainPlayer>> = {
  // Dorsal 6: Nacho Martín (Ignacio Martín Gómez, canterano centrocampista)
  "6": {
    fullName: "Nacho Martín",
    displayName: "Nacho Martín",
    shortName: "Nacho Martín",
    position: "midfielder",
    positionLabel: "Centrocampista",
    positionShort: "MED",
    birthDate: "2002-03-19",
    age: 24,
    nationality: "España",
  },
  // Dorsal 11: Konrad de la Fuente (Delantero / Extremo en lista oficial del club)
  "11": {
    position: "forward",
    positionLabel: "Delantero",
    positionShort: "DEL",
  },
  // Dorsal 20: Nikita Iosifov (Centrocampista en lista oficial del club)
  "20": {
    position: "midfielder",
    positionLabel: "Centrocampista",
    positionShort: "MED",
  },
  // Dorsal 23: Jorge Sáenz (Defensa central)
  "23": {
    displayName: "Jorge Sáenz",
    fullName: "Jorge Sáenz",
    shortName: "J. Sáenz",
  },
  // Dorsal 27: Enol Prendes (Canterano / Sporting Atlético)
  "27": {
    displayName: "Enol Prendes",
    fullName: "Enol Prendes",
    position: "midfielder",
    positionLabel: "Centrocampista",
    positionShort: "MED",
  },
  // Dorsal 28: Miguel Conde (Canterano / Sporting Atlético)
  "28": {
    displayName: "Miguel Conde",
    fullName: "Miguel Conde",
    position: "forward",
    positionLabel: "Delantero",
    positionShort: "DEL",
  },
  // Dorsal 34: Alex Diego (Canterano / Sporting Atlético) — dorsal 34 en ficha oficial
  // Nota: ESPN contiene tanto a Alex Diego (id 77179) como a Mata (id 422029) con dorsal 34.
  // El override canónico por dorsal no debe sobreescribir a Alex Diego.
  "34": {
    displayName: "Mata",
    fullName: "Diego Matabuena",
    position: "midfielder",
    positionLabel: "Centrocampista",
    positionShort: "MED",
  },
  // Dorsal 35: Christian Ferreres (Canterano / Sporting Atlético)
  "35": {
    displayName: "Ferreres",
    fullName: "Christian Ferreres",
    position: "forward",
    positionLabel: "Delantero",
    positionShort: "DEL",
  },
  // Dorsal 36: Bruno Rubio (Canterano / Sporting Atlético)
  "36": {
    displayName: "Bruno Rubio",
    fullName: "Bruno Rubio",
    position: "midfielder",
    positionLabel: "Centrocampista",
    positionShort: "MED",
  },
};

/**
 * Transforms an ESPN athlete entry into a clean DomainPlayer model.
 *
 * @param athlete Validated ESPN athlete payload.
 * @returns Clean DomainPlayer domain model.
 */
export function transformEspnAthlete(athlete: EspnAthlete): DomainPlayer {
  const position = mapEspnPosition(
    athlete.position?.name ?? athlete.position?.displayName
  );
  const positionLabel = mapPositionToLabel(position);
  const positionShort = mapPositionToShort(position);

  let appearances = 0;
  let yellowCards = 0;
  let redCards = 0;
  let goals = 0;
  let assists = 0;
  let saves: number | undefined;
  let goalsConceded: number | undefined;

  const categories = athlete.statistics?.splits?.categories ?? [];
  for (const cat of categories) {
    for (const stat of cat.stats) {
      if (stat.name === "appearances") appearances = stat.value;
      if (stat.name === "yellowCards") yellowCards = stat.value;
      if (stat.name === "redCards") redCards = stat.value;
      if (stat.name === "totalGoals") goals = stat.value;
      if (stat.name === "goalAssists") assists = stat.value;
      if (stat.name === "saves") saves = stat.value;
      if (stat.name === "goalsConceded") goalsConceded = stat.value;
    }
  }

  const parsedJersey = athlete.jersey ? parseInt(athlete.jersey, 10) : null;
  const shirtNumber =
    parsedJersey !== null && !Number.isNaN(parsedJersey) ? parsedJersey : null;

  // Use local official transparent cutout asset if shirtNumber is known; otherwise fallback to ESPN headshot
  const photoUrl =
    (shirtNumber !== null ? `/images/players/${shirtNumber}.png` : null) ??
    athlete.headshot?.href ??
    null;

  const rawPlayer: DomainPlayer = {
    id: `rsg-player-${athlete.id}`,
    externalId: athlete.id,
    fullName: athlete.fullName || athlete.displayName,
    displayName: athlete.displayName || athlete.fullName,
    shortName: athlete.shortName || athlete.displayName || athlete.fullName,
    shirtNumber,
    position,
    positionLabel,
    positionShort,
    age: athlete.age ?? null,
    birthDate: athlete.dateOfBirth ?? null,
    nationality: athlete.citizenship ?? null,
    flagUrl: athlete.flag?.href ?? null,
    photoUrl,
    height: athlete.displayHeight ?? null,
    weight: athlete.displayWeight ?? null,
    stats: {
      appearances,
      goals,
      assists,
      yellowCards,
      redCards,
      saves,
      goalsConceded,
    },
  };

  // Special case: In ESPN's Sporting roster, both Alex Diego (id 77179) and Mata (id 422029)
  // are delivered with jersey '34'. Alex Diego is a defender from Sporting Atlético who debuted in Copa del Rey.
  if (athlete.id === "77179") {
    return {
      ...rawPlayer,
      displayName: "Alex Diego",
      fullName: "Alex Diego García",
      shortName: "Alex Diego",
      position: "defender",
      positionLabel: "Defensa",
      positionShort: "DEF",
    };
  }

  const jerseyKey = shirtNumber !== null ? String(shirtNumber) : null;
  const override = jerseyKey ? ATHLETE_CANONICAL_OVERRIDES[jerseyKey] : undefined;

  if (override) {
    return {
      ...rawPlayer,
      ...override,
    };
  }

  return rawPlayer;
}

/**
 * Fetches the Sporting Gijon official squad from ESPN live open endpoint.
 * Sorts players first by position (goalkeepers -> defenders -> midfielders -> forwards)
 * and secondarily by shirt number ascending.
 *
 * @returns Array of DomainPlayer items.
 */
export async function fetchEspnSportingRoster(): Promise<readonly DomainPlayer[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${ESPN_SEGUNDA_LEAGUE_SLUG}/teams/${ESPN_SPORTING_GIJON_ID}/roster`;

  const response = await fetch(url, {
    method: "GET",
    headers: ESPN_REQUEST_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `ESPN roster API error: ${response.status} ${response.statusText}`
    );
  }

  const json: unknown = await response.json();
  const parsed = espnRosterResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Invalid ESPN roster format: ${parsed.error.message}`);
  }

  const players = parsed.data.athletes.map(transformEspnAthlete);

  // Sort by tactical position group, then by shirt number ascending
  return players.sort((a, b) => {
    const posDiff = POSITION_ORDER[a.position] - POSITION_ORDER[b.position];
    if (posDiff !== 0) return posDiff;

    const numA = a.shirtNumber ?? 999;
    const numB = b.shirtNumber ?? 999;
    return numA - numB;
  });
}


