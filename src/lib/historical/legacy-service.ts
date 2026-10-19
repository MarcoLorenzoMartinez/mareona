import allTimePlayersData from "../../data/historical/club-all-time-players.json" with { type: "json" };
import type { LegacyPlayerRecord } from "./legacy-types";

export { getTopCoaches, groupSeasonsIntoEras } from "./legacy-coaches-service.ts";

interface CanonicalPlayer {
  readonly bdfId: number;
  readonly name: string;
  readonly fullName: string;
  readonly position: string;
  readonly photoUrl: string | null;
  readonly totalPlayed: number;
  readonly totalMinutes: number;
  readonly totalGoals: number;
  readonly seasonCount: number;
  readonly startSeason: string;
  readonly endSeason: string;
}

const allPlayers = allTimePlayersData as readonly CanonicalPlayer[];

/**
 * Computes all-time player rankings by official appearances (matches played).
 */
export function getTopAppearancesPlayers(limit = 100): LegacyPlayerRecord[] {
  const sorted = [...allPlayers].sort(
    (a, b) => b.totalPlayed - a.totalPlayed || b.totalMinutes - a.totalMinutes,
  );

  return sorted.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Computes all-time player rankings by official goals scored.
 */
export function getTopScorersPlayers(limit = 100): LegacyPlayerRecord[] {
  const sorted = [...allPlayers]
    .filter((p) => p.totalGoals > 0)
    .sort((a, b) => b.totalGoals - a.totalGoals || a.totalPlayed - b.totalPlayed);

  return sorted.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Computes all-time player rankings by number of seasons in the first team.
 */
export function getTopSeasonsPlayers(limit = 100): LegacyPlayerRecord[] {
  const sorted = [...allPlayers].sort(
    (a, b) => b.seasonCount - a.seasonCount || b.totalPlayed - a.totalPlayed,
  );

  return sorted.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}
