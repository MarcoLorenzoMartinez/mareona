import { TTL_FIXTURES_MS, TTL_LIVE_MATCH_MS } from "./cache.ts";
import { computeSpotlightTransitionAt } from "./spotlight-fixture.ts";

export const LIVE_POLL_INTERVAL_MS = 15_000;
/** Window before kickoff to begin verifying whether the match has started (10 minutes) */
export const PRE_MATCH_POLL_WINDOW_MS = 10 * 60 * 1000;
/** Upper bound after kickoff so stale scheduled fixtures do not poll indefinitely (4 hours) */
export const MAX_POST_KICKOFF_POLL_MS = 4 * 60 * 60 * 1000;

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
      return (
        now >= kickoffMs - PRE_MATCH_POLL_WINDOW_MS &&
        now <= kickoffMs + MAX_POST_KICKOFF_POLL_MS
      );
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

/**
 * Checks whether a cached season match list holds a scheduled match that has entered
 * the kickoff polling window and must therefore be refreshed from upstream.
 *
 * @param matches Cached season match summaries.
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns True if any scheduled match is imminent or currently past kickoff within the match window.
 */
export function hasStaleScheduledMatch(
  matches: readonly { status: string; kickoffAt?: string | null }[],
  now: number = Date.now()
): boolean {
  return matches.some(
    (m) => m.status === "scheduled" && shouldPollMatch(m.status, true, m.kickoffAt, now)
  );
}

/**
 * Resolves the cache TTL for the Sporting season matches list.
 * Uses the short 15-second TTL whenever a match is live, imminent/in-window, or partial.
 *
 * @param matches Season match summaries.
 * @param isSuspiciousPartial Whether the upstream response looked truncated.
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns TTL in milliseconds.
 */
export function resolveSeasonMatchesTtlMs(
  matches: readonly { status: string; kickoffAt?: string | null }[],
  isSuspiciousPartial: boolean = false,
  now: number = Date.now()
): number {
  const hasLiveOrImminent =
    isSuspiciousPartial ||
    matches.some((m) => m.status === "live") ||
    hasStaleScheduledMatch(matches, now);
  return hasLiveOrImminent ? TTL_LIVE_MATCH_MS : TTL_FIXTURES_MS;
}

/**
 * Determines whether a cached spotlight hero match has crossed its editorial transition
 * boundary (or missed its kickoff window) and needs a one-shot client refresh.
 *
 * @param status Current match status ('scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed').
 * @param isVisible Whether browser document is visible.
 * @param kickoffAt ISO kickoff timestamp of the spotlighted match.
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns True if a single background refresh should run to replace stale cached HTML.
 */
export function shouldRefreshStaleSpotlight(
  status: string | undefined | null,
  isVisible: boolean,
  kickoffAt?: string | null,
  now: number = Date.now()
): boolean {
  if (!isVisible || !status || !kickoffAt) return false;
  const kickoffMs = new Date(kickoffAt).getTime();
  if (Number.isNaN(kickoffMs)) return false;

  if (status === "finished") {
    return now >= computeSpotlightTransitionAt(kickoffAt);
  }
  if (status === "scheduled") {
    return now > kickoffMs + MAX_POST_KICKOFF_POLL_MS;
  }
  return false;
}
