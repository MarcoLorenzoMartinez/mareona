import { TTL_FIXTURES_MS, TTL_LIVE_MATCH_MS } from "./cache.ts";

export const LIVE_POLL_INTERVAL_MS = 15_000;
/** Window before kickoff to begin verifying whether the match has started (10 minutes) */
export const PRE_MATCH_POLL_WINDOW_MS = 10 * 60 * 1000;

/**
 * Pure helper verifying whether a polling cycle should trigger for a single match.
 * STRICT ZERO ESTIMATION POLICY:
 * 1. Never displays "live" based on time; only triggers background polling to check vendor status.
 * 2. If status is officially 'finished', 'cancelled' or 'postponed', polling stops immediately.
 * 3. If status is 'live', polling continues every 15s.
 * 4. If status is 'scheduled' and within 10 minutes of kickoff (or past kickoff), polling starts to detect kickoff.
 *
 * @param status Current match status ('scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed').
 * @param isVisible Whether browser document is visible.
 * @param kickoffAt Optional ISO kickoff timestamp.
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns Boolean indicating if polling should proceed.
 */
export function shouldPollMatch(
  status: string | undefined | null,
  isVisible: boolean,
  kickoffAt?: string | null,
  now: number = Date.now()
): boolean {
  if (!isVisible) return false;
  if (!status || status === "finished" || status === "cancelled" || status === "postponed") {
    return false;
  }
  if (status === "live") {
    return true;
  }
  if (status === "scheduled" && kickoffAt) {
    const kickoffMs = new Date(kickoffAt).getTime();
    if (!Number.isNaN(kickoffMs)) {
      return now >= kickoffMs - PRE_MATCH_POLL_WINDOW_MS;
    }
  }
  return false;
}

/**
 * Pure helper verifying whether a polling cycle should trigger for a list of matches.
 *
 * @param matches Array of match summaries or status items.
 * @param isVisible Whether browser document is visible.
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns Boolean indicating if polling should proceed.
 */
export function shouldPollMatchesList(
  matches: readonly { status: string; kickoffAt?: string }[],
  isVisible: boolean,
  now: number = Date.now()
): boolean {
  if (!isVisible) return false;
  return matches.some((m) => shouldPollMatch(m.status, isVisible, m.kickoffAt, now));
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
