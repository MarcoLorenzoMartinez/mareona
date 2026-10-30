import {
  normalizeTeamName,
  getSeasonLabel,
  type DomainMatchDetail,
  type MatchStatus,
  type DomainAdvancedStats,
} from "./types.ts";
import { formatCopaRound } from "./copa.ts";
import { parseFotMobTacticalLineups } from "./fotmob-lineup-parser.ts";
import {
  parseFotMobMatchLineup,
  parseFotMobMatchEvents,
  type FotMobLineupRawTeam,
  type FotMobRawEvent,
} from "./fotmob-match-detail-parser.ts";

const FOTMOB_SPORTING_ID = 9869;

interface FotMobTeamHeader {
  readonly name: string;
  readonly id: number;
  readonly score?: number | null;
  readonly imageUrl?: string | null;
}

interface FotMobMatchPayload {
  readonly general?: {
    readonly matchId?: string;
    readonly leagueName?: string;
    readonly matchRound?: string;
    readonly leagueRoundName?: string;
    readonly matchTimeUTCDate?: string;
    readonly started?: boolean;
    readonly finished?: boolean;
    readonly venue?: { readonly name?: string; readonly city?: string };
  };
  readonly header?: {
    readonly teams?: readonly FotMobTeamHeader[];
    readonly status?: { readonly started?: boolean; readonly finished?: boolean; readonly cancelled?: boolean };
  };
  readonly content?: {
    readonly lineup?: {
      readonly homeTeam?: FotMobLineupRawTeam;
      readonly awayTeam?: FotMobLineupRawTeam;
    };
    readonly matchFacts?: {
      readonly events?: {
        readonly events?: readonly FotMobRawEvent[];
      };
    };
  };
}

/**
 * Fetches match details from FotMob API as a fallback for Copa del Rey matches.
 *
 * @param matchId FotMob match identifier.
 * @returns DomainMatchDetail or null if unavailable.
 */
export async function fetchFotMobMatchDetail(matchId: string): Promise<DomainMatchDetail | null> {
  try {
    const url = `https://www.fotmob.com/api/data/matchDetails?matchId=${matchId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as FotMobMatchPayload;
    const general = data.general;
    const teams = data.header?.teams;

    if (!general || !teams || teams.length < 2) {
      return null;
    }

    const home = teams[0] as FotMobTeamHeader;
    const away = teams[1] as FotMobTeamHeader;

    const isHomeSporting =
      home.id === FOTMOB_SPORTING_ID || home.name.toLowerCase().includes("sporting");
    const isAwaySporting =
      away.id === FOTMOB_SPORTING_ID || away.name.toLowerCase().includes("sporting");

    const isFinished = Boolean(general.finished || data.header?.status?.finished);
    const isLive = Boolean(general.started && !isFinished);
    const status: MatchStatus = isFinished ? "finished" : isLive ? "live" : "scheduled";

    const homeLineup = parseFotMobMatchLineup(data.content?.lineup?.homeTeam, isHomeSporting);
    const awayLineup = parseFotMobMatchLineup(data.content?.lineup?.awayTeam, isAwaySporting);
    const tacticalLineups = parseFotMobTacticalLineups(
      data.content?.lineup,
      home.id,
      away.id
    );

    const advancedStats: DomainAdvancedStats | null = tacticalLineups
      ? {
          homeXg: 0,
          awayXg: 0,
          homeBigChances: 0,
          awayBigChances: 0,
          homeBigChancesMissed: 0,
          awayBigChancesMissed: 0,
          homeBoxTouches: 0,
          awayBoxTouches: 0,
          homeDuelsWon: 0,
          awayDuelsWon: 0,
          shots: [],
          playerStats: {},
          tacticalLineups,
        }
      : null;

    const events = parseFotMobMatchEvents(
      data.content?.matchFacts?.events?.events ?? [],
      isHomeSporting,
      isAwaySporting,
      String(home.id),
      String(away.id)
    );

    return {
      externalId: matchId,
      competition: general.leagueName || "Copa del Rey",
      roundName: formatCopaRound(general.matchRound || general.leagueRoundName),
      season: getSeasonLabel(),
      matchday: null,
      kickoffAt: general.matchTimeUTCDate || new Date().toISOString(),
      status,
      isTimeConfirmed: !data.header?.status?.cancelled,
      venue: general.venue?.name
        ? { name: general.venue.name, city: general.venue.city ?? null }
        : null,
      attendance: null,
      homeTeam: {
        externalId: String(home.id),
        name: normalizeTeamName(home.name, isHomeSporting),
        crestUrl: home.imageUrl || `https://images.fotmob.com/image_resources/logo/teamlogo/${home.id}.png`,
        isSporting: isHomeSporting,
      },
      awayTeam: {
        externalId: String(away.id),
        name: normalizeTeamName(away.name, isAwaySporting),
        crestUrl: away.imageUrl || `https://images.fotmob.com/image_resources/logo/teamlogo/${away.id}.png`,
        isSporting: isAwaySporting,
      },
      homeScore: isFinished || isLive ? (home.score ?? 0) : null,
      awayScore: isFinished || isLive ? (away.score ?? 0) : null,
      events,
      statGroups: [],
      homeLineup,
      awayLineup,
      advancedStats,
    };
  } catch {
    return null;
  }
}
