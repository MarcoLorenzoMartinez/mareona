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
import { isSafeAvatarUrl } from "../../src/lib/auth/schemas.ts";

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

  it("blocks open redirect attempts to external protocols, backslashes, or double slashes", () => {
    assert.strictEqual(sanitizeNextPath("//attacker.com"), "/temporada");
    assert.strictEqual(sanitizeNextPath("/\\attacker.com"), "/temporada");
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

  it("validates avatar URLs against safe preset and HTTPS host allowlist", () => {
    assert.strictEqual(isSafeAvatarUrl("/avatars/presets/molinon.svg"), true);
    assert.strictEqual(isSafeAvatarUrl("https://lh3.googleusercontent.com/a/photo"), true);
    assert.strictEqual(isSafeAvatarUrl("https://xyz.supabase.co/storage/v1/object/public/avatars/u/a.webp"), true);
    assert.strictEqual(isSafeAvatarUrl("https://evil.com/huge.png"), false);
    assert.strictEqual(isSafeAvatarUrl("http://lh3.googleusercontent.com/a/photo"), false);
    assert.strictEqual(isSafeAvatarUrl("/avatars/presets/../../etc/passwd"), false);
  });
});
