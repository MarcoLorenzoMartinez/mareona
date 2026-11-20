import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterPostsByOrigin,
  formatMatchOriginLabel,
} from "../../src/lib/social/format.ts";

describe("formatMatchOriginLabel", () => {
  it("formats home and away team names into a concise matchup", () => {
    assert.equal(
      formatMatchOriginLabel("Real Sporting", "Racing"),
      "Real Sporting vs Racing"
    );
  });

  it("trims whitespace and returns null when either team is missing", () => {
    assert.equal(formatMatchOriginLabel("  Real Sporting ", " Oviedo "), "Real Sporting vs Oviedo");
    assert.equal(formatMatchOriginLabel(null, "Oviedo"), null);
    assert.equal(formatMatchOriginLabel("Real Sporting", "   "), null);
  });
});

describe("filterPostsByOrigin", () => {
  const sample = [
    { id: "1", matchId: null },
    { id: "2", matchId: "match-123" },
    { id: "3" },
  ];

  it("returns all posts for 'all'", () => {
    assert.deepEqual(
      filterPostsByOrigin(sample, "all").map((p) => p.id),
      ["1", "2", "3"]
    );
  });

  it("returns only general social posts for 'social'", () => {
    assert.deepEqual(
      filterPostsByOrigin(sample, "social").map((p) => p.id),
      ["1", "3"]
    );
  });

  it("returns only match grada posts for 'grada'", () => {
    assert.deepEqual(
      filterPostsByOrigin(sample, "grada").map((p) => p.id),
      ["2"]
    );
  });
});
