import { parseFotMobPlayerProfile } from "./fotmob-player-profile-parser.ts";
import type { DomainPlayerProfile, FotMobRawPlayerData } from "./fotmob-player-profile-types.ts";
import { parseFotMobPlayerStats, type FotMobRawPlayerStatItem } from "./fotmob-player-parser.ts";
import type { DomainPlayerMatchStats } from "./types.ts";
import {
  mergePlayerSeasonMatches,
  type SportingTeamFixtureItem,
} from "./fotmob-player-fixtures-merger.ts";

const FOTMOB_SPORTING_ID = 9869;
const FOTMOB_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
};

export {
  resolveSportingPlayerId,
  CANONICAL_FOTMOB_SPORTING_PLAYERS,
} from "./fotmob-player-resolver.ts";

/**
 * Fetches the comprehensive profile of a player from FotMob.
 */
export async function fetchFotMobPlayerProfile(
  playerId: number
): Promise<DomainPlayerProfile | null> {
  try {
    const [playerRes, teamRes] = await Promise.all([
      fetch(`https://www.fotmob.com/api/data/playerData?id=${playerId}`, {
        headers: FOTMOB_HEADERS,
        cache: "no-store",
      }),
      fetch(`https://www.fotmob.com/api/data/teams?id=${FOTMOB_SPORTING_ID}`, {
        headers: FOTMOB_HEADERS,
        cache: "no-store",
      }).catch(() => null),
    ]);

    if (!playerRes.ok) return null;

    const raw = (await playerRes.json()) as FotMobRawPlayerData;
    const baseProfile = parseFotMobPlayerProfile(raw);

    let teamFixtures: readonly SportingTeamFixtureItem[] = [];
    if (teamRes && teamRes.ok) {
      try {
        const teamData = (await teamRes.json()) as {
          readonly fixtures?: {
            readonly allFixtures?: {
              readonly fixtures?: readonly SportingTeamFixtureItem[];
            };
          };
        };
        teamFixtures = teamData.fixtures?.allFixtures?.fixtures ?? [];
      } catch {
        teamFixtures = [];
      }
    }

    if (teamFixtures.length === 0) {
      try {
        const { fetchSportingSeasonMatches } = await import("./client.ts");
        const seasonMatches = await fetchSportingSeasonMatches();
        const finished = seasonMatches.filter((m) => m.status === "finished");
        teamFixtures = finished.map((sm) => ({
          id: parseInt(sm.externalId, 10) || 0,
          status: { utcTime: sm.kickoffAt, finished: true },
          tournament: { name: sm.competition },
          home: { id: sm.homeTeam.isSporting ? FOTMOB_SPORTING_ID : 0, name: sm.homeTeam.name, score: sm.homeScore ?? 0 },
          away: { id: sm.awayTeam.isSporting ? FOTMOB_SPORTING_ID : 0, name: sm.awayTeam.name, score: sm.awayScore ?? 0 },
        }));
      } catch {
        // Fallback gracefully
      }
    }

    const recentMatches = mergePlayerSeasonMatches(teamFixtures, baseProfile.recentMatches);

    return {
      ...baseProfile,
      recentMatches,
    };
  } catch {
    return null;
  }
}

interface MatchDetailsPayload {
  readonly content?: {
    readonly playerStats?: Record<string, FotMobRawPlayerStatItem>;
  };
}

/**
 * Fetches single match breakdown statistics for a specific player in a given match.
 */
export async function fetchPlayerSingleMatchStats(
  matchId: number,
  playerId: number,
  playerName?: string
): Promise<DomainPlayerMatchStats | null> {
  try {
    const res = await fetch(`https://www.fotmob.com/api/data/matchDetails?matchId=${matchId}`, {
      headers: FOTMOB_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as MatchDetailsPayload;
    const parsedStats = parseFotMobPlayerStats(data.content?.playerStats);
    if (!parsedStats) return null;

    const byId = parsedStats[String(playerId)];
    if (byId) return byId;

    if (playerName) {
      const byName = parsedStats[playerName.toLowerCase()];
      if (byName) return byName;
    }

    return null;
  } catch {
    return null;
  }
}
