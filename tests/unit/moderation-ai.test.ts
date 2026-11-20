import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseModerationResponse,
  isProfileActivelyBanned,
  BANNED_USER_POST_MESSAGE,
  READ_ONLY_WALL_MESSAGE,
} from "../../src/lib/social/moderation-ai.ts";

describe("parseModerationResponse", () => {
  it("accepts a valid verdict", () => {
    assert.deepEqual(parseModerationResponse('{"verdict":"block","reason":"insulto"}'), {
      verdict: "block",
      reason: "insulto",
    });
    assert.equal(parseModerationResponse('{"verdict":"allow"}').verdict, "allow");
  });

  it("degrades to flag on malformed or unknown output", () => {
    assert.equal(parseModerationResponse("not json").verdict, "flag");
    assert.equal(parseModerationResponse('{"verdict":"maybe"}').verdict, "flag");
    assert.equal(parseModerationResponse(null).verdict, "flag");
    assert.equal(parseModerationResponse("").reason, "ai_empty_response");
  });
});

describe("isProfileActivelyBanned", () => {
  const now = new Date("2026-11-20T18:00:00Z").getTime();

  it("returns false for null, undefined, or unbanned profiles", () => {
    assert.equal(isProfileActivelyBanned(null, now), false);
    assert.equal(isProfileActivelyBanned(undefined, now), false);
    assert.equal(isProfileActivelyBanned({ is_banned: false, banned_until: null }, now), false);
  });

  it("returns true for permanent bans (is_banned = true, banned_until = null)", () => {
    assert.equal(isProfileActivelyBanned({ is_banned: true, banned_until: null }, now), true);
  });

  it("returns true when temporary ban expiration is in the future", () => {
    assert.equal(
      isProfileActivelyBanned({ is_banned: true, banned_until: "2026-11-25T18:00:00Z" }, now),
      true
    );
  });

  it("returns false when temporary ban expiration has already passed", () => {
    assert.equal(
      isProfileActivelyBanned({ is_banned: true, banned_until: "2026-11-19T18:00:00Z" }, now),
      false
    );
  });

  it("exposes clear Spanish messages for banned users and read-only wall mode", () => {
    assert.ok(BANNED_USER_POST_MESSAGE.includes("suspendida"));
    assert.ok(READ_ONLY_WALL_MESSAGE.includes("solo lectura"));
  });
});
