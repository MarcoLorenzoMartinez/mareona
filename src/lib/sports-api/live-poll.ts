export const LIVE_POLL_INTERVAL_MS = 15_000;

/**
 * Pure helper verifying whether a polling cycle should trigger.
 *
 * @param status Current match status ('scheduled' | 'live' | 'finished').
 * @param isVisible Whether browser document is visible.
 * @returns Boolean indicating if polling should proceed.
 */
export function shouldPollMatch(status: string, isVisible: boolean): boolean {
  return status === "live" && isVisible;
}
