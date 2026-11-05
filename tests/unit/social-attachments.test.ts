import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { attachmentRefSchema, STAT_KEYS } from "../../src/lib/social/attachments/schemas.ts";
import { buildStatItem, buildStatItems } from "../../src/lib/social/attachments/stat-catalog.ts";
import { formatScoreLine } from "../../src/lib/social/attachments/format.ts";
import type { TeamSeasonStats } from "../../src/lib/sports-api/team-season-types.ts";

const overrides: Record<string, number> = {
  averagePossession: 54.26,
  possessionRank: 3,
  foulsPerMatch: 12.04,
  foulsRank: 0,
  redCards: 2,
  redCardsRank: 9,
};

// Every other numeric field defaults to 1 so the whole catalog can be exercised.
const stats = new Proxy(overrides, {
  get: (target, prop: string) => target[prop] ?? 1,
}) as unknown as TeamSeasonStats;

describe("attachment schema", () => {
  it("accepts every reference kind", () => {
    assert.ok(attachmentRefSchema.safeParse({ type: "stat", key: "averagePossession" }).success);
    assert.ok(attachmentRefSchema.safeParse({ type: "player", playerId: "123" }).success);
    assert.ok(attachmentRefSchema.safeParse({ type: "match", matchId: "abc" }).success);
    assert.ok(
      attachmentRefSchema.safeParse({ type: "historical_match", seasonId: "2014-15", matchId: "m1" }).success
    );
  });

  it("rejects unknown stats, malformed seasons and extra types", () => {
    assert.equal(attachmentRefSchema.safeParse({ type: "stat", key: "nope" }).success, false);
    assert.equal(
      attachmentRefSchema.safeParse({ type: "historical_match", seasonId: "2014", matchId: "m1" }).success,
      false
    );
    assert.equal(attachmentRefSchema.safeParse({ type: "image", url: "x" }).success, false);
  });
});

describe("stat catalog", () => {
  it("formats values and treats rank 0 as unavailable", () => {
    const possession = buildStatItem(stats, "averagePossession");
    assert.equal(possession.value, "54.3%");
    assert.equal(possession.rank, 3);
    assert.equal(possession.category, "Posesión");

    const fouls = buildStatItem(stats, "foulsPerMatch");
    assert.equal(fouls.rank, null);
    assert.equal(fouls.lowerIsBetter, true);
  });

  it("exposes exactly the declared stat keys", () => {
    assert.deepEqual(
      buildStatItems(stats).map((s) => s.key).sort(),
      [...STAT_KEYS].sort()
    );
  });
});

describe("formatScoreLine", () => {
  it("shows the score only for played matches", () => {
    assert.equal(formatScoreLine("Real Sporting", "Real Oviedo", 2, 0), "Real Sporting 2-0 Real Oviedo");
    assert.equal(formatScoreLine("Real Sporting", "Real Oviedo", null, null), "Real Sporting vs Real Oviedo");
  });
});
