"use server";

import { fetchPlayerSingleMatchStats } from "@/lib/sports-api/fotmob-player-profile";
import type { DomainPlayerMatchStats } from "@/lib/sports-api/types";

/**
 * Server Action: Fetches detailed individual match statistics for a player in a specific match.
 *
 * @param matchId FotMob match identifier.
 * @param playerId FotMob player identifier.
 * @param playerName Player display name fallback for stats lookup.
 * @returns DomainPlayerMatchStats or null if stats are unavailable.
 */
export async function getPlayerMatchStatsAction(
  matchId: number,
  playerId: number,
  playerName?: string
): Promise<DomainPlayerMatchStats | null> {
  return fetchPlayerSingleMatchStats(matchId, playerId, playerName);
}
