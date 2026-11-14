/**
 * Window in which an OAuth authenticated account is considered freshly registered.
 * Supabase offers no "first login" flag for OAuth, so account age is the primary signal.
 */
export const NEW_USER_WINDOW_MS = 120_000;

/**
 * Detects accounts created moments ago, which must complete the name and handle onboarding.
 *
 * @param createdAt - ISO timestamp of `user.created_at`.
 * @param nowMs - Current time in milliseconds (injectable for tests).
 * @returns `true` when the account was created within {@link NEW_USER_WINDOW_MS}.
 */
export function isRecentSignup(createdAt: string, nowMs: number = Date.now()): boolean {
  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return false;
  return Math.abs(nowMs - createdAtMs) < NEW_USER_WINDOW_MS;
}

export interface OnboardingDetectionInput {
  readonly createdAt?: string | null;
  readonly otpType?: string | null;
  readonly explicitOnboardingParam?: string | null;
  readonly nowMs?: number;
}

/**
 * Determines whether an authentication callback should open the identity onboarding step.
 * Covers instant OAuth registrations as well as delayed email confirmation links where
 * more than a minute may elapse between form submission and clicking the email button.
 *
 * @param input - Callback parameters and user metadata timestamps.
 * @returns `true` if the user should be prompted to confirm their display name and handle.
 */
export function shouldTriggerOnboarding(input: OnboardingDetectionInput): boolean {
  if (input.explicitOnboardingParam === "true" || input.explicitOnboardingParam === "1") {
    return true;
  }
  if (input.otpType === "signup") {
    return true;
  }
  if (input.createdAt) {
    return isRecentSignup(input.createdAt, input.nowMs);
  }
  return false;
}
