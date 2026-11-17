/**
 * Formats an ISO date as a short Spanish relative label (e.g. "hace 5 min").
 *
 * @param dateStr - ISO 8601 timestamp.
 * @returns Human readable label; "reciente" when the date cannot be parsed.
 */
export function formatRelativeTime(dateStr: string): string {
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return "reciente";

  const diffMinutes = Math.floor((Date.now() - time) / (1000 * 60));
  if (diffMinutes < 1) return "ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ayer";
  return `hace ${diffDays} d`;
}

/** 15-minute edit window threshold (in milliseconds). */
export const POST_EDIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Checks whether a post or comment is within the allowed 15-minute edit window.
 */
export function canEditPost(dateStr: string): boolean {
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= POST_EDIT_WINDOW_MS;
}
