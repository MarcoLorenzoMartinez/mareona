import {
  normalizeTeamName,
  getSeasonLabel,
  type DomainMatchSummary,
  type MatchStatus,
} from "./types.ts";

const FOTMOB_SPORTING_ID = 9869;

export interface FotMobTeamFixtureItem {
  readonly id: number;
  readonly home: { readonly id: number; readonly name: string; readonly score?: number | null };
  readonly away: { readonly id: number; readonly name: string; readonly score?: number | null };
  readonly tournament?: { readonly name?: string; readonly leagueId?: number };
  readonly status: {
    readonly utcTime: string;
    readonly started?: boolean;
    readonly finished?: boolean;
    readonly cancelled?: boolean;
  };
}

interface FotMobTeamResponse {
  readonly fixtures?: {
    readonly allFixtures?: {
      readonly fixtures?: readonly FotMobTeamFixtureItem[];
    };
  };
}

/**
 * Maps a single FotMob fixture entry to DomainMatchSummary for Copa del Rey.
 *
 * @param f FotMob team fixture item.
 * @returns Standardized DomainMatchSummary entity.
 */
export function mapFotMobCopaFixtureToDomain(f: FotMobTeamFixtureItem): DomainMatchSummary {
  const isHomeSporting =
    f.home.id === FOTMOB_SPORTING_ID ||
    f.home.name.toLowerCase().includes("sporting");
  const isAwaySporting =
    f.away.id === FOTMOB_SPORTING_ID ||
    f.away.name.toLowerCase().includes("sporting");

  const isFinished = Boolean(f.status.finished);
  const isLive = Boolean(f.status.started && !f.status.finished);
  const status: MatchStatus = isFinished
    ? "finished"
    : isLive
    ? "live"
    : "scheduled";

  const homeCrest = `https://images.fotmob.com/image_resources/logo/teamlogo/${f.home.id}.png`;
  const awayCrest = `https://images.fotmob.com/image_resources/logo/teamlogo/${f.away.id}.png`;

  return {
    externalId: String(f.id),
    competition: "Copa del Rey",
    season: getSeasonLabel(),
    matchday: null,
    kickoffAt: f.status.utcTime,
    status,
    venue: null,
    isTimeConfirmed: !f.status.cancelled,
    homeTeam: {
      externalId: String(f.home.id),
      name: normalizeTeamName(f.home.name, isHomeSporting),
      crestUrl: homeCrest,
      isSporting: isHomeSporting,
    },
    awayTeam: {
      externalId: String(f.away.id),
      name: normalizeTeamName(f.away.name, isAwaySporting),
      crestUrl: awayCrest,
      isSporting: isAwaySporting,
    },
    homeScore: isFinished || isLive ? (f.home.score ?? 0) : null,
    awayScore: isFinished || isLive ? (f.away.score ?? 0) : null,
  };
}

/**
 * Fetches the official Copa del Rey matches for Real Sporting from FotMob schedule.
 *
 * @returns Array of DomainMatchSummary items corresponding to Copa del Rey fixtures.
 */
export async function fetchSportingCopaMatches(): Promise<readonly DomainMatchSummary[]> {
  try {
    const url = `https://www.fotmob.com/api/data/teams?id=${FOTMOB_SPORTING_ID}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return [];
    }

    const json = (await res.json()) as FotMobTeamResponse;
    const fixtures = json.fixtures?.allFixtures?.fixtures ?? [];

    const copaFixtures = fixtures.filter((f) =>
      f.tournament?.name?.toLowerCase().includes("copa")
    );

    return copaFixtures.map(mapFotMobCopaFixtureToDomain);
  } catch {
    return [];
  }
}
