import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  clampGoogleButtonWidth,
  createGoogleNonce,
  getGoogleIdentity,
} from "../../src/lib/auth/google-identity.ts";
import { isRecentSignup, NEW_USER_WINDOW_MS } from "../../src/lib/auth/new-user.ts";

describe("Google Identity nonce", () => {
  it("hashes the raw nonce with SHA-256 in lowercase hex", async () => {
    const { raw, hashed } = await createGoogleNonce();

    assert.equal(hashed, createHash("sha256").update(raw).digest("hex"));
    assert.match(hashed, /^[0-9a-f]{64}$/);
  });

  it("produces a long, unique raw nonce on every call", async () => {
    const first = await createGoogleNonce();
    const second = await createGoogleNonce();

    assert.equal(first.raw.length, 64);
    assert.notEqual(first.raw, second.raw);
    assert.notEqual(first.hashed, second.hashed);
  });
});

describe("Google button width", () => {
  it("clamps to the 200-400px range accepted by Google", () => {
    assert.equal(clampGoogleButtonWidth(120), 200);
    assert.equal(clampGoogleButtonWidth(336.7), 336);
    assert.equal(clampGoogleButtonWidth(900), 400);
  });
});

describe("Google Identity global", () => {
  it("returns null when the script is unavailable", () => {
    assert.equal(getGoogleIdentity(), null);
  });
});

describe("New user detection", () => {
  const now = Date.parse("2026-11-13T12:00:00Z");

  it("flags accounts created within the onboarding window", () => {
    assert.equal(isRecentSignup("2026-11-13T11:59:30Z", now), true);
  });

  it("ignores accounts older than the window", () => {
    const old = new Date(now - NEW_USER_WINDOW_MS - 1).toISOString();
    assert.equal(isRecentSignup(old, now), false);
    assert.equal(isRecentSignup("2026-01-01T00:00:00Z", now), false);
  });

  it("treats unparseable timestamps as existing accounts", () => {
    assert.equal(isRecentSignup("not-a-date", now), false);
  });
});
