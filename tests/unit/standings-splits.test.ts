import test from "node:test";
import assert from "node:assert/strict";
import {
  getSortedStandings,
  type DomainStandingRow,
} from "../../src/lib/sports-api/types.ts";

const sampleRows: readonly DomainStandingRow[] = [
  {
    position: 1,
    teamExternalId: "6832",
    teamName: "Almería",
    crestUrl: null,
    played: 9,
    won: 7,
    drawn: 0,
    lost: 2,
    goalsFor: 16,
    goalsAgainst: 5,
    points: 21,
    isSporting: false,
    home: { played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 10, goalsAgainst: 2, points: 12 },
    away: { played: 4, won: 3, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 3, points: 9 },
  },
  {
    position: 6,
    teamExternalId: "3788",
    teamName: "Real Sporting",
    crestUrl: null,
    played: 9,
    won: 5,
    drawn: 1,
    lost: 3,
    goalsFor: 9,
    goalsAgainst: 8,
    points: 16,
    isSporting: true,
    home: { played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 4, goalsAgainst: 5, points: 7 },
    away: { played: 4, won: 3, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, points: 9 },
  },
  {
    position: 15,
    teamExternalId: "98",
    teamName: "Las Palmas",
    crestUrl: null,
    played: 9,
    won: 3,
    drawn: 2,
    lost: 4,
    goalsFor: 13,
    goalsAgainst: 16,
    points: 11,
    isSporting: false,
    home: { played: 4, won: 1, drawn: 2, lost: 1, goalsFor: 5, goalsAgainst: 5, points: 5 },
    away: { played: 5, won: 2, drawn: 0, lost: 3, goalsFor: 8, goalsAgainst: 11, points: 6 },
  },
];

test("getSortedStandings with scope 'total' preserves canonical position and metrics", () => {
  const sorted = getSortedStandings(sampleRows, "total");
  assert.equal(sorted.length, 3);
  assert.equal(sorted[0].teamName, "Almería");
  assert.equal(sorted[0].position, 1);
  assert.equal(sorted[1].teamName, "Real Sporting");
  assert.equal(sorted[1].position, 6);
  assert.equal(sorted[2].teamName, "Las Palmas");
  assert.equal(sorted[2].position, 15);
});

test("getSortedStandings with scope 'home' re-sorts table by home metrics", () => {
  const sorted = getSortedStandings(sampleRows, "home");
  assert.equal(sorted.length, 3);
  // Almería: 12 pts en casa -> 1º
  assert.equal(sorted[0].teamName, "Almería");
  assert.equal(sorted[0].position, 1);
  assert.equal(sorted[0].points, 12);
  assert.equal(sorted[0].played, 5);

  // Real Sporting: 7 pts en casa -> 2º
  assert.equal(sorted[1].teamName, "Real Sporting");
  assert.equal(sorted[1].position, 2);
  assert.equal(sorted[1].points, 7);
  assert.equal(sorted[1].played, 5);

  // Las Palmas: 5 pts en casa -> 3º
  assert.equal(sorted[2].teamName, "Las Palmas");
  assert.equal(sorted[2].position, 3);
  assert.equal(sorted[2].points, 5);
});

test("getSortedStandings with scope 'away' ranks away ties by goal difference", () => {
  const sorted = getSortedStandings(sampleRows, "away");
  assert.equal(sorted.length, 3);

  // Both Almería and Sporting have 9 away points, but Almería GD is +3 (6-3), Sporting is +2 (5-3)
  assert.equal(sorted[0].teamName, "Almería");
  assert.equal(sorted[0].position, 1);
  assert.equal(sorted[0].points, 9);

  assert.equal(sorted[1].teamName, "Real Sporting");
  assert.equal(sorted[1].position, 2);
  assert.equal(sorted[1].points, 9);

  assert.equal(sorted[2].teamName, "Las Palmas");
  assert.equal(sorted[2].position, 3);
  assert.equal(sorted[2].points, 6);
});
