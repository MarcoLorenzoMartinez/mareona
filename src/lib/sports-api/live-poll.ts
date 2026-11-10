import { TTL_FIXTURES_MS, TTL_LIVE_MATCH_MS } from "./cache.ts";

export const LIVE_POLL_INTERVAL_MS = 15_000;

/**
 * Pure helper verifying whether a polling cycle should trigger for a single match.
 *
 * @param status Current match status ('scheduled' | 'live' | 'finished').
 * @param isVisible Whether browser document is visible.
 * @returns Boolean indicating if polling should proceed.
 */
export function shouldPollMatch(status: string, isVisible: boolean): boolean {
  return status === "live" && isVisible;
}

/**
 * Pure helper verifying whether a polling cycle should trigger for a list of matches.
 *
 * @param statuses Array of match status strings.
 * @param isVisible Whether browser document is visible.
 * @returns Boolean indicating if polling should proceed.
 */
export function shouldPollMatchesList(
  statuses: readonly string[],
  isVisible: boolean
): boolean {
  if (!isVisible) return false;
  return statuses.some((status) => status === "live");
}

/**
 * Resolves the cache TTL in milliseconds for fixture lists depending on live match presence.
 *
 * @param hasLiveMatch Whether the fixture collection currently has a match in play.
 * @returns TTL in milliseconds (15s if live, 12h otherwise).
 */
export function resolveFixturesListTtlMs(hasLiveMatch: boolean): number {
  return hasLiveMatch ? TTL_LIVE_MATCH_MS : TTL_FIXTURES_MS;
}
