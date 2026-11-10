import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveMatchDetailTtlMs,
  TTL_LIVE_MATCH_MS,
  TTL_FIXTURES_MS,
} from "../../src/lib/sports-api/cache.ts";
import {
  shouldPollMatch,
  shouldPollMatchesList,
  resolveFixturesListTtlMs,
  LIVE_POLL_INTERVAL_MS,
} from "../../src/lib/sports-api/live-poll.ts";

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

  describe("resolveFixturesListTtlMs", () => {
    it("returns 15 seconds TTL when a match is currently in play", () => {
      assert.equal(resolveFixturesListTtlMs(true), TTL_LIVE_MATCH_MS);
    });

    it("returns 12 hours TTL when no match is in play", () => {
      assert.equal(resolveFixturesListTtlMs(false), TTL_FIXTURES_MS);
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

  describe("shouldPollMatchesList", () => {
    it("allows polling when tab is visible and at least one match is live", () => {
      const statuses = ["finished", "live", "scheduled"];
      assert.equal(shouldPollMatchesList(statuses, true), true);
    });

    it("pauses polling when tab is hidden, even if matches are live", () => {
      const statuses = ["finished", "live", "scheduled"];
      assert.equal(shouldPollMatchesList(statuses, false), false);
    });

    it("prevents polling when all matches are finished or scheduled", () => {
      const allFinished = ["finished", "finished", "finished"];
      const allScheduled = ["scheduled", "scheduled"];
      assert.equal(shouldPollMatchesList(allFinished, true), false);
      assert.equal(shouldPollMatchesList(allScheduled, true), false);
    });

    it("handles empty match lists gracefully without polling", () => {
      assert.equal(shouldPollMatchesList([], true), false);
    });
  });

  describe("LIVE_POLL_INTERVAL_MS", () => {
    it("defines 15-second polling interval for responsive live experiences", () => {
      assert.equal(LIVE_POLL_INTERVAL_MS, 15_000);
    });
  });
});
