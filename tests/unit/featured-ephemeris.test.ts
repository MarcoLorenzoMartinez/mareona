import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getMadridMonthDay,
  pickFeaturedEphemeris,
} from "../../src/lib/historical/featured-ephemeris.ts";
import type {
  DayEphemeridesResult,
  DayMatchItem,
  EphemerisMilestone,
} from "../../src/lib/historical/ephemerides-types.ts";

const EMPTY_BALANCE = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };

function buildMatch(overrides: Partial<DayMatchItem>): DayMatchItem {
  return {
    id: "m",
    season: "1980-81",
    date: "16/11/1980",
    year: 1980,
    competition: "LaLiga",
    round: "",
    homeTeam: "Real Sporting",
    awayTeam: "Rival",
    homeScore: 1,
    awayScore: 0,
    isHome: true,
    outcome: "V",
    opponent: "Rival",
    homeCrestUrl: null,
    awayCrestUrl: null,
    ...overrides,
  };
}

function buildMilestone(overrides: Partial<EphemerisMilestone>): EphemerisMilestone {
  return {
    id: "e",
    month: 11,
    day: 16,
    category: "milestone",
    categoryLabel: "Hito",
    title: "Hito",
    description: "Descripción",
    ...overrides,
  };
}

function buildResult(
  matches: DayMatchItem[],
  milestones: EphemerisMilestone[]
): DayEphemeridesResult {
  return { month: 11, day: 16, dateLabel: "16 de noviembre", matches, milestones, balance: EMPTY_BALANCE };
}

describe("pickFeaturedEphemeris", () => {
  it("returns null when the day has no records", () => {
    assert.equal(pickFeaturedEphemeris(buildResult([], [])), null);
  });

  it("prefers milestones by category priority over matches", () => {
    const featured = pickFeaturedEphemeris(
      buildResult(
        [buildMatch({})],
        [
          buildMilestone({ category: "signing", title: "Fichaje", year: 2001 }),
          buildMilestone({ category: "triumph", title: "Ascenso", year: 1977, categoryLabel: "Gesta" }),
        ]
      )
    );
    assert.deepEqual(featured, {
      year: 1977,
      title: "Ascenso",
      detail: "Descripción",
      photoUrl: null,
      figure: undefined,
      categoryLabel: "Gesta",
      isMatch: false,
    });
  });

  it("prioritizes prestigious first-division win over blowout early round in cup", () => {
    const featured = pickFeaturedEphemeris(
      buildResult(
        [
          buildMatch({
            id: "cup-blowout",
            competition: "Copa del Rey",
            round: "Ronda 1",
            homeScore: 5,
            awayScore: 0,
            opponent: "UP Langreo",
            year: 1983,
          }),
          buildMatch({
            id: "laliga-classic",
            competition: "LaLiga",
            round: "Jornada 4",
            homeScore: 2,
            awayScore: 1,
            opponent: "FC Barcelona",
            year: 1991,
          }),
        ],
        []
      )
    );
    assert.equal(featured?.title, "Real Sporting 2–1 Rival");
    assert.equal(featured?.year, 1991);
    assert.equal(featured?.isMatch, true);
  });

  it("falls back to the widest Sporting win, counting away fixtures correctly", () => {
    const featured = pickFeaturedEphemeris(
      buildResult(
        [
          buildMatch({ id: "a", homeScore: 2, awayScore: 0, year: 1990 }),
          buildMatch({
            id: "b",
            isHome: false,
            homeTeam: "Rival",
            awayTeam: "Real Sporting",
            homeScore: 0,
            awayScore: 4,
            year: 1985,
            homeCrestUrl: "https://example.com/crest.png",
          }),
          buildMatch({ id: "c", outcome: "D", homeScore: 0, awayScore: 5, year: 2000 }),
        ],
        []
      )
    );
    assert.equal(featured?.title, "Rival 0–4 Real Sporting");
    assert.equal(featured?.matchId, "b");
    assert.equal(featured?.year, 1985);
    assert.equal(featured?.photoUrl, "https://example.com/crest.png");
  });
});

describe("getMadridMonthDay", () => {
  it("uses the Madrid calendar day rather than UTC", () => {
    assert.deepEqual(getMadridMonthDay(new Date("2026-11-16T23:30:00Z")), { month: 11, day: 17 });
    assert.deepEqual(getMadridMonthDay(new Date("2026-07-01T22:30:00Z")), { month: 7, day: 2 });
  });
});
