import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeNextPath,
  buildEmailConfirmationUrl,
} from "../../src/lib/auth/oauth-redirect.ts";
import {
  isRecentSignup,
  shouldTriggerOnboarding,
} from "../../src/lib/auth/new-user.ts";
import { isEmailDeliveryFailure } from "../../src/lib/auth/email-fallback.ts";

describe("OAuth & Email Callback Route - Path Sanitization & Onboarding Logic", () => {
  it("preserves legitimate relative paths", () => {
    assert.strictEqual(sanitizeNextPath("/temporada"), "/temporada");
    assert.strictEqual(sanitizeNextPath("/social"), "/social");
    assert.strictEqual(sanitizeNextPath("/juegos/porra"), "/juegos/porra");
  });

  it("falls back to /temporada when next is null or empty", () => {
    assert.strictEqual(sanitizeNextPath(null), "/temporada");
    assert.strictEqual(sanitizeNextPath(""), "/temporada");
  });

  it("blocks open redirect attempts to external protocols or double slashes", () => {
    assert.strictEqual(sanitizeNextPath("//attacker.com"), "/temporada");
    assert.strictEqual(sanitizeNextPath("https://attacker.com"), "/temporada");
    assert.strictEqual(sanitizeNextPath("javascript:alert(1)"), "/temporada");
  });

  it("builds email confirmation URL with onboarding=true and sanitized next path", () => {
    const url = buildEmailConfirmationUrl("https://mareona.es", "/social");
    const parsed = new URL(url);
    assert.strictEqual(parsed.origin, "https://mareona.es");
    assert.strictEqual(parsed.pathname, "/auth/callback");
    assert.strictEqual(parsed.searchParams.get("next"), "/social");
    assert.strictEqual(parsed.searchParams.get("onboarding"), "true");
  });

  it("triggers onboarding for email signup confirmations even when confirmed hours later", () => {
    const twoHoursAgoIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    assert.strictEqual(
      isRecentSignup(twoHoursAgoIso),
      false,
      "Account created 2 hours ago is outside the instant OAuth window"
    );

    assert.strictEqual(
      shouldTriggerOnboarding({
        createdAt: twoHoursAgoIso,
        otpType: "signup",
        explicitOnboardingParam: null,
      }),
      true,
      "OTP type=signup must always trigger onboarding regardless of delay"
    );

    assert.strictEqual(
      shouldTriggerOnboarding({
        createdAt: twoHoursAgoIso,
        otpType: null,
        explicitOnboardingParam: "true",
      }),
      true,
      "Explicit onboarding=true param from emailRedirectTo must always trigger onboarding"
    );
  });

  it("detects email delivery and rate-limit failures without false-positiving on user errors", () => {
    assert.strictEqual(
      isEmailDeliveryFailure("Error sending confirmation email", "unexpected_failure", 500),
      true
    );
    assert.strictEqual(
      isEmailDeliveryFailure("Email rate limit exceeded", "over_email_send_rate_limit", 429),
      true
    );
    assert.strictEqual(
      isEmailDeliveryFailure("SMTP relay connection refused", null, 503),
      true
    );
    assert.strictEqual(
      isEmailDeliveryFailure("User already registered", "user_already_exists", 422),
      false
    );
    assert.strictEqual(
      isEmailDeliveryFailure("Invalid login credentials", "invalid_credentials", 400),
      false
    );
  });
});
