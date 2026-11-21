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

export const ABORT_REGISTRATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface OnboardingEligibilityInput {
  readonly hasUser: boolean;
  readonly explicitSignupFlow?: boolean;
  readonly userCreatedAt?: string | null;
  readonly profileCreatedAt?: string | null;
  readonly profileUpdatedAt?: string | null;
  readonly nowMs?: number;
}

/**
 * Checks whether an authenticated session is genuinely in an uncompleted onboarding state.
 * Prevents shared `?onboarding=true` URLs or guest loads from trapping established accounts
 * inside the destructive onboarding modal.
 */
export function isOnboardingEligible(input: OnboardingEligibilityInput): boolean {
  if (!input.hasUser) return false;
  if (input.explicitSignupFlow) return true;

  const nowMs = input.nowMs ?? Date.now();
  if (input.userCreatedAt && isRecentSignup(input.userCreatedAt, nowMs)) {
    return true;
  }

  if (input.profileCreatedAt && input.profileUpdatedAt) {
    const createdMs = new Date(input.profileCreatedAt).getTime();
    const updatedMs = new Date(input.profileUpdatedAt).getTime();
    if (!Number.isNaN(createdMs) && !Number.isNaN(updatedMs)) {
      return Math.abs(updatedMs - createdMs) <= 1000;
    }
  }

  return false;
}

export interface AbortRegistrationGuardInput {
  readonly userCreatedAt?: string | null;
  readonly profileCreatedAt?: string | null;
  readonly profileUpdatedAt?: string | null;
  readonly points?: number | null;
  readonly nowMs?: number;
}

/**
 * Server-side and client-side safety guard ensuring `abortRegistration` can only delete
 * freshly created, unedited accounts without accumulated activity.
 */
export function canSafelyAbortRegistration(input: AbortRegistrationGuardInput): boolean {
  if ((input.points ?? 0) > 0) return false;

  const nowMs = input.nowMs ?? Date.now();
  const createdMs = input.userCreatedAt ? new Date(input.userCreatedAt).getTime() : Number.NaN;
  if (Number.isNaN(createdMs) || Math.abs(nowMs - createdMs) > ABORT_REGISTRATION_WINDOW_MS) {
    return false;
  }

  if (input.profileCreatedAt && input.profileUpdatedAt) {
    const profileCreatedMs = new Date(input.profileCreatedAt).getTime();
    const profileUpdatedMs = new Date(input.profileUpdatedAt).getTime();
    if (
      !Number.isNaN(profileCreatedMs) &&
      !Number.isNaN(profileUpdatedMs) &&
      Math.abs(profileUpdatedMs - profileCreatedMs) > 1000
    ) {
      return false;
    }
  }

  return true;
}
