import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeSpotlightTransitionAt,
  resolveSpotlightFixture,
  getMadridDateParts,
} from "../../src/lib/sports-api/spotlight-fixture.ts";
import type { DomainMatchSummary } from "../../src/lib/sports-api/types.ts";

function createMockMatch(
  id: string,
  kickoffAt: string,
  status: "scheduled" | "live" | "finished",
  homeScore: number | null = null,
  awayScore: number | null = null
): DomainMatchSummary {
  return {
    externalId: id,
    competition: "LaLiga Hypermotion",
    season: "2026/27",
    matchday: 14,
    kickoffAt,
    status,
    isTimeConfirmed: true,
    homeTeam: {
      externalId: "20983",
      name: "Real Sociedad B",
      crestUrl: null,
      isSporting: false,
    },
    awayTeam: {
      externalId: "3788",
      name: "Real Sporting",
      crestUrl: null,
      isSporting: true,
    },
    venue: null,
    homeScore,
    awayScore,
  };
}

describe("Spotlight Fixture Transition & Editorial Logic", () => {
  describe("getMadridDateParts", () => {
    it("extracts correct Madrid calendar day and weekday", () => {
      // 2026-11-14T15:15:00Z is Saturday Nov 14 (16:15 CET)
      const parts = getMadridDateParts(new Date("2026-11-14T15:15:00Z"));
      assert.equal(parts.year, 2026);
      assert.equal(parts.month, 11);
      assert.equal(parts.day, 14);
      assert.equal(parts.dayOfWeek, 6); // Saturday
    });
  });

  describe("computeSpotlightTransitionAt", () => {
    it("transitions Saturday match on the following Tuesday at 00:00 Madrid", () => {
      const saturdayMatch = "2026-11-14T15:15:00Z";
      const nextMatch = "2026-11-22T15:15:00Z"; // Following Sunday
      const transitionAt = computeSpotlightTransitionAt(saturdayMatch, nextMatch);
      const transitionDate = new Date(transitionAt);
      const parts = getMadridDateParts(transitionDate);
      assert.equal(parts.year, 2026);
      assert.equal(parts.month, 11);
      assert.equal(parts.day, 17);
      assert.equal(parts.dayOfWeek, 2); // Tuesday
      // 00:00 Madrid in CET is 23:00 UTC previous night
      assert.equal(transitionDate.toISOString(), "2026-11-16T23:00:00.000Z");
    });

    it("transitions Friday match on the following Tuesday at 00:00 Madrid", () => {
      const fridayMatch = "2026-11-13T19:30:00Z";
      const nextMatch = "2026-11-22T15:15:00Z";
      const transitionAt = computeSpotlightTransitionAt(fridayMatch, nextMatch);
      const transitionDate = new Date(transitionAt);
      assert.equal(transitionDate.toISOString(), "2026-11-16T23:00:00.000Z");
    });

    it("transitions Sunday match on the following Tuesday at 00:00 Madrid", () => {
      const sundayMatch = "2026-11-15T17:30:00Z";
      const nextMatch = "2026-11-22T15:15:00Z";
      const transitionAt = computeSpotlightTransitionAt(sundayMatch, nextMatch);
      const transitionDate = new Date(transitionAt);
      assert.equal(transitionDate.toISOString(), "2026-11-16T23:00:00.000Z");
    });

    it("transitions Monday match on the following Wednesday at 00:00 Madrid", () => {
      const mondayMatch = "2026-11-16T19:30:00Z";
      const nextMatch = "2026-11-22T15:15:00Z";
      const transitionAt = computeSpotlightTransitionAt(mondayMatch, nextMatch);
      const transitionDate = new Date(transitionAt);
      const parts = getMadridDateParts(transitionDate);
      assert.equal(parts.day, 18);
      assert.equal(parts.dayOfWeek, 3); // Wednesday
      assert.equal(transitionDate.toISOString(), "2026-11-17T23:00:00.000Z");
    });

    it("transitions midweek Wednesday Copa match on Friday at 00:00 Madrid", () => {
      const wednesdayCopa = "2026-11-18T20:00:00Z";
      const nextMatch = "2026-11-22T15:15:00Z";
      const transitionAt = computeSpotlightTransitionAt(wednesdayCopa, nextMatch);
      const transitionDate = new Date(transitionAt);
      const parts = getMadridDateParts(transitionDate);
      assert.equal(parts.day, 20);
      assert.equal(parts.dayOfWeek, 5); // Friday
      assert.equal(transitionDate.toISOString(), "2026-11-19T23:00:00.000Z");
    });
  });

  describe("resolveSpotlightFixture", () => {
    const saturdayMatch = createMockMatch(
      "match-14",
      "2026-11-14T15:15:00Z",
      "finished",
      2,
      2
    );
    const nextSundayMatch = createMockMatch(
      "match-15",
      "2026-11-22T15:15:00Z",
      "scheduled",
      null,
      null
    );

    it("spotlights live match immediately regardless of other matches", () => {
      const liveMatch = createMockMatch(
        "match-live",
        "2026-11-14T15:15:00Z",
        "live",
        1,
        0
      );
      const result = resolveSpotlightFixture([saturdayMatch, liveMatch, nextSundayMatch]);
      assert.equal(result?.externalId, "match-live");
    });

    it("spotlights finished Saturday match on Sunday (the day after)", () => {
      const sundayNoon = new Date("2026-11-15T12:00:00Z").getTime();
      const result = resolveSpotlightFixture([saturdayMatch, nextSundayMatch], sundayNoon);
      assert.equal(result?.externalId, "match-14");
      assert.equal(result?.homeScore, 2);
      assert.equal(result?.awayScore, 2);
    });

    it("spotlights finished Saturday match on Monday night before midnight", () => {
      const mondayNight = new Date("2026-11-16T22:30:00Z").getTime(); // 23:30 Madrid
      const result = resolveSpotlightFixture([saturdayMatch, nextSundayMatch], mondayNight);
      assert.equal(result?.externalId, "match-14");
    });

    it("flips cleanly to upcoming match on Tuesday at 00:00 Madrid", () => {
      const tuesdayMorning = new Date("2026-11-17T08:00:00Z").getTime();
      const result = resolveSpotlightFixture([saturdayMatch, nextSundayMatch], tuesdayMorning);
      assert.equal(result?.externalId, "match-15");
      assert.equal(result?.status, "scheduled");
    });

    it("handles list with only upcoming matches by returning first upcoming", () => {
      const result = resolveSpotlightFixture([nextSundayMatch]);
      assert.equal(result?.externalId, "match-15");
    });

    it("handles list with only finished matches by returning last finished", () => {
      const result = resolveSpotlightFixture([saturdayMatch]);
      assert.equal(result?.externalId, "match-14");
    });

    it("returns null when match list is empty", () => {
      assert.equal(resolveSpotlightFixture([]), null);
    });
  });
});
