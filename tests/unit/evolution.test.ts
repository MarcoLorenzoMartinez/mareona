import test from "node:test";
import assert from "node:assert/strict";
import {
  getSportingSeasonEvolution,
  type DomainMatchSummary,
  type DomainStandingRow,
} from "../../src/lib/sports-api/types.ts";

const SAMPLE_MATCHES: readonly DomainMatchSummary[] = [
  {
    externalId: "m1",
    competition: "LaLiga Hypermotion",
    season: "2026/27",
    matchday: 1,
    kickoffAt: "2026-08-16T19:30:00Z",
    status: "finished",
    venue: "El Molinón",
    isTimeConfirmed: true,
    homeTeam: { externalId: "3788", name: "Real Sporting", crestUrl: null, isSporting: true },
    awayTeam: { externalId: "cadiz", name: "Cádiz CF", crestUrl: null, isSporting: false },
    homeScore: 1,
    awayScore: 0,
  },
  {
    externalId: "m2",
    competition: "LaLiga Hypermotion",
    season: "2026/27",
    matchday: 2,
    kickoffAt: "2026-08-23T19:30:00Z",
    status: "finished",
    venue: "Balaídos",
    isTimeConfirmed: true,
    homeTeam: { externalId: "celta", name: "Celta Fortuna", crestUrl: null, isSporting: false },
    awayTeam: { externalId: "3788", name: "Real Sporting", crestUrl: null, isSporting: true },
    homeScore: 2,
    awayScore: 3,
  },
  {
    externalId: "m3",
    competition: "LaLiga Hypermotion",
    season: "2026/27",
    matchday: 3,
    kickoffAt: "2026-08-30T19:30:00Z",
    status: "finished",
    venue: "Carlos Tartiere",
    isTimeConfirmed: true,
    homeTeam: { externalId: "oviedo", name: "Real Oviedo", crestUrl: null, isSporting: false },
    awayTeam: { externalId: "3788", name: "Real Sporting", crestUrl: null, isSporting: true },
    homeScore: 2,
    awayScore: 0,
  },
  {
    externalId: "m4",
    competition: "LaLiga Hypermotion",
    season: "2026/27",
    matchday: 4,
    kickoffAt: "2026-09-06T19:30:00Z",
    status: "scheduled",
    venue: "El Molinón",
    isTimeConfirmed: true,
    homeTeam: { externalId: "3788", name: "Real Sporting", crestUrl: null, isSporting: true },
    awayTeam: { externalId: "andorra", name: "FC Andorra", crestUrl: null, isSporting: false },
    homeScore: null,
    awayScore: null,
  },
];

const SPORTING_STANDING: DomainStandingRow = {
  position: 6,
  teamExternalId: "3788",
  teamName: "Real Sporting",
  crestUrl: null,
  played: 9,
  won: 5,
  drawn: 1,
  lost: 3,
  goalsFor: 10,
  goalsAgainst: 8,
  points: 16,
  isSporting: true,
};

test("getSportingSeasonEvolution returns empty list when matches array is empty", () => {
  const evolution = getSportingSeasonEvolution([]);
  assert.equal(evolution.length, 0);
});

test("getSportingSeasonEvolution ignores scheduled matches and computes points correctly", () => {
  const evolution = getSportingSeasonEvolution(SAMPLE_MATCHES, SPORTING_STANDING);
  assert.equal(evolution.length, 3);

  // J1: W 1-0 at home vs Cádiz -> 3 pts, pos 5
  assert.equal(evolution[0]?.matchday, 1);
  assert.equal(evolution[0]?.opponent, "Cádiz CF");
  assert.equal(evolution[0]?.isHome, true);
  assert.equal(evolution[0]?.result, "W");
  assert.equal(evolution[0]?.matchPoints, 3);
  assert.equal(evolution[0]?.cumulativePoints, 3);
  assert.equal(evolution[0]?.position, 5);

  // J2: W 3-2 away vs Celta Fortuna -> 3 pts -> 6 cumulative, pos 2
  assert.equal(evolution[1]?.matchday, 2);
  assert.equal(evolution[1]?.opponent, "Celta Fortuna");
  assert.equal(evolution[1]?.isHome, false);
  assert.equal(evolution[1]?.result, "W");
  assert.equal(evolution[1]?.matchPoints, 3);
  assert.equal(evolution[1]?.cumulativePoints, 6);
  assert.equal(evolution[1]?.position, 2);

  // J3: L 0-2 away vs Real Oviedo -> 0 pts -> 6 cumulative, pos 5
  assert.equal(evolution[2]?.matchday, 3);
  assert.equal(evolution[2]?.opponent, "Real Oviedo");
  assert.equal(evolution[2]?.isHome, false);
  assert.equal(evolution[2]?.result, "L");
  assert.equal(evolution[2]?.matchPoints, 0);
  assert.equal(evolution[2]?.cumulativePoints, 6);
  assert.equal(evolution[2]?.position, 5);
});
