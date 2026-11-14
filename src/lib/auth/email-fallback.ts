/**
 * Determines whether a Supabase Auth error was caused by an email delivery failure,
 * SMTP outage, or email sending rate limit rather than invalid user credentials.
 *
 * When this returns `true`, the server can activate the fail-safe contingency
 * (auto-confirming the account and signing the user in directly) so fans are never
 * blocked from registering if the transactional email provider is down or exhausted.
 *
 * @param message - Raw error message from Supabase Auth.
 * @param code - Optional error code returned by Supabase Auth (`AuthError.code`).
 * @param status - Optional HTTP status code returned by Supabase Auth (`AuthError.status`).
 * @returns `true` if the failure is strictly related to email dispatch or rate limiting.
 */
export function isEmailDeliveryFailure(
  message: string,
  code?: string | null,
  status?: number | null
): boolean {
  const normalizedMsg = (message || "").toLowerCase();
  const normalizedCode = (code || "").toLowerCase();

  // Never treat user input or duplicate account errors as SMTP failures
  if (
    normalizedMsg.includes("already registered") ||
    normalizedMsg.includes("already been registered") ||
    normalizedMsg.includes("invalid login credentials") ||
    normalizedMsg.includes("password should be") ||
    normalizedMsg.includes("weak_password") ||
    normalizedCode === "user_already_exists" ||
    normalizedCode === "email_exists" ||
    normalizedCode === "weak_password" ||
    normalizedCode === "validation_failed"
  ) {
    return false;
  }

  if (
    normalizedCode === "over_email_send_rate_limit" ||
    normalizedCode === "unexpected_failure"
  ) {
    return true;
  }

  if (
    normalizedMsg.includes("error sending confirmation email") ||
    normalizedMsg.includes("error sending email") ||
    normalizedMsg.includes("email rate limit exceeded") ||
    normalizedMsg.includes("over_email_send_rate_limit") ||
    normalizedMsg.includes("for security purposes, you can only request this") ||
    normalizedMsg.includes("smtp") ||
    normalizedMsg.includes("failed to send email")
  ) {
    return true;
  }

  // Supabase GoTrue returns HTTP 500 or 429 when the downstream SMTP relay rejects or times out
  if (status === 500 || status === 502 || status === 503 || status === 504 || status === 429) {
    return true;
  }

  return false;
}
