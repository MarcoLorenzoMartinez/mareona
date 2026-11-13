/**
 * Window in which an authenticated account is still considered freshly registered.
 * Supabase offers no "first login" flag for OAuth, so account age is the only signal.
 */
export const NEW_USER_WINDOW_MS = 60_000;

/**
 * Detects accounts created moments ago, which must complete the name and handle onboarding.
 *
 * @param createdAt - ISO timestamp of `user.created_at`.
 * @param nowMs - Current time in milliseconds (injectable for tests).
 * @returns `true` when the account was created within {@link NEW_USER_WINDOW_MS}.
 */
export function isRecentSignup(createdAt: string, nowMs: number = Date.now()): boolean {
  const createdAtMs = new Date(createdAt).getTime();
  return Math.abs(nowMs - createdAtMs) < NEW_USER_WINDOW_MS;
}
