import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveStandingZone,
  selectStandingsWindow,
} from "../../src/lib/sports-api/standings-window.ts";
import type { DomainStandingRow } from "../../src/lib/sports-api/types.ts";

function buildTable(total: number, sportingPosition: number | null): DomainStandingRow[] {
  return Array.from({ length: total }, (_, index) => ({
    position: index + 1,
    teamExternalId: String(index + 1),
    teamName: `Team ${index + 1}`,
    crestUrl: null,
    played: 10,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 50 - index,
    isSporting: index + 1 === sportingPosition,
  }));
}

function windowPositions(sportingPosition: number | null, total = 22): number[] {
  return selectStandingsWindow(buildTable(total, sportingPosition)).map((row) => row.position);
}

describe("selectStandingsWindow", () => {
  it("centres Sporting with three rivals on each side", () => {
    assert.deepEqual(windowPositions(8), [5, 6, 7, 8, 9, 10, 11]);
  });

  it("slides against the top edge instead of shrinking", () => {
    assert.deepEqual(windowPositions(1), [1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(windowPositions(3), [1, 2, 3, 4, 5, 6, 7]);
  });

  it("slides against the bottom edge instead of shrinking", () => {
    assert.deepEqual(windowPositions(22), [16, 17, 18, 19, 20, 21, 22]);
    assert.deepEqual(windowPositions(20), [16, 17, 18, 19, 20, 21, 22]);
  });

  it("falls back to the leading places when Sporting is missing", () => {
    assert.deepEqual(windowPositions(null), [1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns the whole table when it is not longer than the window", () => {
    assert.deepEqual(windowPositions(2, 5), [1, 2, 3, 4, 5]);
    assert.deepEqual(selectStandingsWindow([]), []);
  });
});
describe("resolveStandingZone", () => {
  it("maps positions to the current second-division zones", () => {
    assert.equal(resolveStandingZone(2, 22), "promotion");
    assert.equal(resolveStandingZone(6, 22), "playoff");
    assert.equal(resolveStandingZone(12, 22), "none");
    assert.equal(resolveStandingZone(19, 22), "relegation");
  });

  it("does not flag relegation until the table has more than four teams", () => {
    assert.equal(resolveStandingZone(8, 8), "relegation");
    assert.equal(resolveStandingZone(4, 4), "playoff");
  });
});

