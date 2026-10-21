import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveMatchDetailTtlMs,
  TTL_LIVE_MATCH_MS,
  TTL_FIXTURES_MS,
} from "../../src/lib/sports-api/cache.ts";
import { shouldPollMatch } from "../../src/lib/sports-api/live-poll.ts";

describe("Live Match Polling & Dynamic TTL", () => {
  describe("resolveMatchDetailTtlMs", () => {
    it("returns 15 seconds TTL for live matches", () => {
      const ttl = resolveMatchDetailTtlMs("live");
      assert.equal(ttl, 15_000);
      assert.equal(ttl, TTL_LIVE_MATCH_MS);
    });

    it("returns 12 hours TTL for scheduled and finished matches", () => {
      assert.equal(resolveMatchDetailTtlMs("scheduled"), TTL_FIXTURES_MS);
      assert.equal(resolveMatchDetailTtlMs("finished"), TTL_FIXTURES_MS);
    });
  });

  describe("shouldPollMatch", () => {
    it("allows polling only when match is live and tab is visible", () => {
      assert.equal(shouldPollMatch("live", true), true);
    });

    it("pauses polling when tab is hidden, even if match is live", () => {
      assert.equal(shouldPollMatch("live", false), false);
    });

    it("prevents polling for finished or scheduled matches regardless of visibility", () => {
      assert.equal(shouldPollMatch("finished", true), false);
      assert.equal(shouldPollMatch("scheduled", true), false);
    });
  });
});
