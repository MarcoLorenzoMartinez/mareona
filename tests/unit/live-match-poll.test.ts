import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  resolveMatchDetailTtlMs,
  TTL_LIVE_MATCH_MS,
  TTL_FIXTURES_MS,
} from "../../src/lib/sports-api/cache.ts";
import {
  shouldPollMatch,
  shouldPollMatchesList,
  resolveFixturesListTtlMs,
  hasStaleScheduledMatch,
  resolveSeasonMatchesTtlMs,
  LIVE_POLL_INTERVAL_MS,
  PRE_MATCH_POLL_WINDOW_MS,
} from "../../src/lib/sports-api/live-poll.ts";

describe("Live Match Polling & Dynamic TTL", () => {
  describe("resolveMatchDetailTtlMs", () => {
    it("returns 15 seconds TTL for live matches", () => {
      const ttl = resolveMatchDetailTtlMs("live");
      assert.equal(ttl, 15_000);
      assert.equal(ttl, TTL_LIVE_MATCH_MS);
    });

    it("returns 12 hours TTL for finished matches", () => {
      assert.equal(resolveMatchDetailTtlMs("finished"), TTL_FIXTURES_MS);
    });

    it("returns 15 seconds TTL for scheduled matches entering kickoff window", () => {
      const now = new Date("2026-11-14T16:10:00Z").getTime();
      const kickoffAt = "2026-11-14T16:15:00Z"; // 5 min before kickoff
      const ttl = resolveMatchDetailTtlMs("scheduled", kickoffAt, now);
      assert.equal(ttl, TTL_LIVE_MATCH_MS);
    });

    it("returns full TTL for scheduled matches distant in the future", () => {
      const now = new Date("2026-11-14T10:00:00Z").getTime();
      const kickoffAt = "2026-11-22T15:15:00Z"; // 8 days away
      const ttl = resolveMatchDetailTtlMs("scheduled", kickoffAt, now);
      assert.equal(ttl, TTL_FIXTURES_MS);
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

  describe("hasStaleScheduledMatch & resolveSeasonMatchesTtlMs", () => {
    it("detects scheduled matches entering kickoff window so memory/DB caches invalidate", () => {
      const now = new Date("2026-11-14T16:10:00Z").getTime();
      const matches = [
        { status: "finished", kickoffAt: "2026-11-07T16:15:00Z" },
        { status: "scheduled", kickoffAt: "2026-11-14T16:15:00Z" },
      ];
      assert.equal(hasStaleScheduledMatch(matches, now), true);
      assert.equal(resolveSeasonMatchesTtlMs(matches, false, now), TTL_LIVE_MATCH_MS);
    });

    it("keeps 12h TTL when all scheduled matches are distant in the future", () => {
      const now = new Date("2026-11-14T10:00:00Z").getTime();
      const matches = [
        { status: "finished", kickoffAt: "2026-11-07T16:15:00Z" },
        { status: "scheduled", kickoffAt: "2026-11-22T15:15:00Z" },
      ];
      assert.equal(hasStaleScheduledMatch(matches, now), false);
      assert.equal(resolveSeasonMatchesTtlMs(matches, false, now), TTL_FIXTURES_MS);
    });

    it("returns 15s TTL when a match is already live", () => {
      const matches = [{ status: "live", kickoffAt: "2026-11-14T16:15:00Z" }];
      assert.equal(resolveSeasonMatchesTtlMs(matches, false), TTL_LIVE_MATCH_MS);
    });
  });

  describe("shouldPollMatch", () => {
    it("allows polling when match is live and tab is visible", () => {
      assert.equal(shouldPollMatch("live", true), true);
    });

    it("pauses polling when tab is hidden, even if match is live", () => {
      assert.equal(shouldPollMatch("live", false), false);
    });

    it("strictly forbids polling for finished matches (zero fake live estimation)", () => {
      assert.equal(shouldPollMatch("finished", true), false);
      assert.equal(shouldPollMatch("finished", true, "2026-11-14T16:15:00Z"), false);
      assert.equal(shouldPollMatch("cancelled", true), false);
      assert.equal(shouldPollMatch("postponed", true), false);
    });

    it("prevents polling for scheduled matches far before kickoff", () => {
      const now = new Date("2026-11-14T10:00:00Z").getTime();
      const kickoff = "2026-11-14T16:15:00Z"; // 6 hours ahead
      assert.equal(shouldPollMatch("scheduled", true, kickoff, now), false);
    });

    it("enables polling for scheduled matches within 10 minutes of kickoff to detect start", () => {
      const now = new Date("2026-11-14T16:08:00Z").getTime();
      const kickoff = "2026-11-14T16:15:00Z"; // 7 minutes before kickoff
      assert.equal(shouldPollMatch("scheduled", true, kickoff, now), true);
    });

    it("enables polling for scheduled matches past kickoff to detect delayed start", () => {
      const now = new Date("2026-11-14T16:20:00Z").getTime();
      const kickoff = "2026-11-14T16:15:00Z"; // 5 minutes after scheduled kickoff
      assert.equal(shouldPollMatch("scheduled", true, kickoff, now), true);
    });
  });

  describe("shouldPollMatchesList", () => {
    it("allows polling when at least one match is live", () => {
      const matches = [
        { status: "finished" },
        { status: "live" },
        { status: "scheduled", kickoffAt: "2026-11-20T20:00:00Z" },
      ];
      assert.equal(shouldPollMatchesList(matches, true), true);
    });

    it("allows polling when a scheduled match is within 10 minutes of kickoff", () => {
      const now = new Date("2026-11-14T16:10:00Z").getTime();
      const matches = [
        { status: "finished" },
        { status: "scheduled", kickoffAt: "2026-11-14T16:15:00Z" },
      ];
      assert.equal(shouldPollMatchesList(matches, true, now), true);
    });

    it("pauses polling when tab is hidden", () => {
      const matches = [{ status: "live" }];
      assert.equal(shouldPollMatchesList(matches, false), false);
    });

    it("prevents polling when all matches are finished", () => {
      const matches = [{ status: "finished" }, { status: "finished" }];
      assert.equal(shouldPollMatchesList(matches, true), false);
    });

    it("handles empty match lists gracefully", () => {
      assert.equal(shouldPollMatchesList([], true), false);
    });
  });

  describe("PRE_MATCH_POLL_WINDOW_MS", () => {
    it("defines 10-minute pre-match detection window", () => {
      assert.equal(PRE_MATCH_POLL_WINDOW_MS, 10 * 60 * 1000);
    });
  });

  describe("LIVE_POLL_INTERVAL_MS", () => {
    it("defines 15-second polling interval for responsive live experiences", () => {
      assert.equal(LIVE_POLL_INTERVAL_MS, 15_000);
    });
  });

  describe("useLiveMatchesPoll stability", () => {
    it("does not depend on the mutable matches array reference inside useEffect", () => {
      const hookPath = path.join(
        process.cwd(),
        "src/app/(main)/temporada/use-live-matches-poll.ts"
      );
      const source = fs.readFileSync(hookPath, "utf8");
      assert.match(source, /\[\s*shouldPoll\s*,\s*fetchUpdate\s*\]/);
      assert.doesNotMatch(source, /\[\s*matches\s*,\s*fetchUpdate\s*\]/);
    });
  });
});
