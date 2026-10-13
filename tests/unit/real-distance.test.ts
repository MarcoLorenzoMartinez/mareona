import test from "node:test";
import assert from "node:assert/strict";
import {
  getRealDistanceLadder,
  type DomainStandingRow,
} from "../../src/lib/sports-api/types.ts";

const sampleRows: readonly DomainStandingRow[] = [
  {
    position: 1,
    teamExternalId: "3752",
    teamName: "Eibar",
    crestUrl: null,
    played: 9,
    won: 7,
    drawn: 0,
    lost: 2,
    goalsFor: 15,
    goalsAgainst: 5,
    points: 21,
    isSporting: false,
  },
  {
    position: 2,
    teamExternalId: "4438",
    teamName: "Castellón",
    crestUrl: null,
    played: 9,
    won: 6,
    drawn: 2,
    lost: 1,
    goalsFor: 14,
    goalsAgainst: 7,
    points: 20,
    isSporting: false,
  },
  {
    position: 3,
    teamExternalId: "6832",
    teamName: "Almería",
    crestUrl: null,
    played: 9,
    won: 5,
    drawn: 3,
    lost: 1,
    goalsFor: 12,
    goalsAgainst: 6,
    points: 18,
    isSporting: false,
  },
  {
    position: 5,
    teamExternalId: "9812",
    teamName: "Girona",
    crestUrl: null,
    played: 9,
    won: 4,
    drawn: 2,
    lost: 3,
    goalsFor: 11,
    goalsAgainst: 10,
    points: 14,
    isSporting: false,
  },
  {
    position: 6,
    teamExternalId: "3788",
    teamName: "Real Sporting",
    crestUrl: null,
    played: 9,
    won: 4,
    drawn: 2,
    lost: 3,
    goalsFor: 10,
    goalsAgainst: 9,
    points: 14,
    isSporting: true,
  },
  {
    position: 22,
    teamExternalId: "2737",
    teamName: "Albacete",
    crestUrl: null,
    played: 9,
    won: 3,
    drawn: 1,
    lost: 5,
    goalsFor: 8,
    goalsAgainst: 14,
    points: 10,
    isSporting: false,
  },
];

test("getRealDistanceLadder builds continuous ladder from max to min points", () => {
  const ladder = getRealDistanceLadder(sampleRows);
  assert.equal(ladder.length, 12); // from 21 down to 10 inclusive = 12 rungs
  assert.equal(ladder[0].points, 21);
  assert.equal(ladder[ladder.length - 1].points, 10);
});

test("getRealDistanceLadder identifies empty rungs (point gaps)", () => {
  const ladder = getRealDistanceLadder(sampleRows);
  // Point 19 has no teams (gap between Castellón 20 and Almería 18)
  const rung19 = ladder.find((r) => r.points === 19);
  assert.ok(rung19);
  assert.equal(rung19.teams.length, 0);

  // Point 17, 16, 15 also have no teams
  const rung17 = ladder.find((r) => r.points === 17);
  assert.ok(rung17);
  assert.equal(rung17.teams.length, 0);
});

test("getRealDistanceLadder groups multiple teams on the same points rung", () => {
  const ladder = getRealDistanceLadder(sampleRows);
  // Point 14 has both Girona and Real Sporting
  const rung14 = ladder.find((r) => r.points === 14);
  assert.ok(rung14);
  assert.equal(rung14.teams.length, 2);
  const names = rung14.teams.map((t) => t.teamName);
  assert.ok(names.includes("Real Sporting"));
  assert.ok(names.includes("Girona"));
});

test("getRealDistanceLadder returns empty array when input is empty", () => {
  const ladder = getRealDistanceLadder([]);
  assert.deepEqual(ladder, []);
});
