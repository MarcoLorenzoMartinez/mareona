import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveSpotlightFixture } from "../../src/lib/sports-api/spotlight-fixture.ts";
import type { DomainMatchSummary } from "../../src/lib/sports-api/types.ts";

function createMockMatch(
  id: string,
  kickoffAt: string,
  status: "scheduled" | "live" | "finished",
  name: string = "Rival",
  isSportingHome: boolean = false
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
      externalId: isSportingHome ? "3788" : "999",
      name: isSportingHome ? "Real Sporting" : name,
      crestUrl: null,
      isSporting: isSportingHome,
    },
    awayTeam: {
      externalId: isSportingHome ? "999" : "3788",
      name: isSportingHome ? name : "Real Sporting",
      crestUrl: null,
      isSporting: !isSportingHome,
    },
    venue: null,
    homeScore: status === "finished" ? 2 : null,
    awayScore: status === "finished" ? 2 : null,
  };
}

describe("Spotlight Fixture Fallback Resilience Suite", () => {
  const saturdayMatch = createMockMatch(
    "match-14",
    "2026-11-14T15:15:00Z",
    "finished",
    "Real Sociedad B"
  );
  const nextSundayMatch = createMockMatch(
    "match-15",
    "2026-11-22T15:15:00Z",
    "scheduled",
    "Las Palmas",
    true
  );

  it("safeguards spotlight transition when upcoming match is appended after partial schedule fetch", () => {
    // Thursday noon after Saturday's match (past Tuesday 00:00 transition)
    const thursdayNoon = new Date("2026-11-19T12:00:00Z").getTime();

    // Incomplete vendor schedule has only the finished match
    const incompleteSchedule = [saturdayMatch];
    const fallbackIncomplete = resolveSpotlightFixture(incompleteSchedule, thursdayNoon);
    assert.equal(
      fallbackIncomplete?.externalId,
      "match-14",
      "Without upcoming fixtures, resolver falls back to last finished"
    );

    // Resilient fallback appends nextFixture from live match connector
    const enrichedSchedule = [...incompleteSchedule, nextSundayMatch];
    const resolvedSpotlight = resolveSpotlightFixture(enrichedSchedule, thursdayNoon);
    assert.equal(
      resolvedSpotlight?.externalId,
      "match-15",
      "With next fixture appended, resolver correctly spotlights upcoming match on Thursday"
    );
    assert.equal(resolvedSpotlight?.homeTeam.name, "Real Sporting");
    assert.equal(resolvedSpotlight?.awayTeam.name, "Las Palmas");
  });

  it("preserves weekend post-match display on Sunday even when upcoming match is present", () => {
    // Sunday noon right after Saturday match
    const sundayNoon = new Date("2026-11-15T12:00:00Z").getTime();
    const schedule = [saturdayMatch, nextSundayMatch];
    const resolved = resolveSpotlightFixture(schedule, sundayNoon);

    assert.equal(
      resolved?.externalId,
      "match-14",
      "Keeps displaying finished match result on Sunday"
    );
  });
});
