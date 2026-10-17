import test from "node:test";
import assert from "node:assert/strict";
import {
  getEphemeridesForDay,
  formatDayMonthLabel,
} from "../../src/lib/historical/ephemerides-service.ts";

test("formatDayMonthLabel formats Spanish date accurately", () => {
  assert.equal(formatDayMonthLabel(10, 17), "17 de octubre");
  assert.equal(formatDayMonthLabel(7, 1), "1 de julio");
  assert.equal(formatDayMonthLabel(12, 3), "3 de diciembre");
});

test("getEphemeridesForDay retrieves matches and milestones for 17 de octubre", () => {
  const result = getEphemeridesForDay(10, 17);

  assert.equal(result.month, 10);
  assert.equal(result.day, 17);
  assert.equal(result.dateLabel, "17 de octubre");

  // There are 13 official historical matches on 17th October
  assert.equal(result.matches.length, 13);
  assert.equal(result.balance.played, 13);
  assert.equal(result.balance.won + result.balance.drawn + result.balance.lost, 13);

  // Spot check 2010 match vs Sevilla FC
  const m2010 = result.matches.find((m) => m.season === "2010-11");
  assert.ok(m2010);
  assert.equal(m2010.opponent, "Sevilla FC");
  assert.equal(m2010.homeScore, 2);
  assert.equal(m2010.awayScore, 0);
  assert.equal(m2010.outcome, "V");

  // Spot check milestone for 17 October (Sevilla triumph)
  assert.ok(result.milestones.length >= 1);
  const sevillaMilestone = result.milestones.find((m) => m.id === "eph-oct-17-sevilla-triunfo");
  assert.ok(sevillaMilestone);
});

test("getEphemeridesForDay retrieves milestone for club foundation on 1 de julio", () => {
  const result = getEphemeridesForDay(7, 1);
  assert.equal(result.dateLabel, "1 de julio");
  const foundation = result.milestones.find((m) => m.id === "eph-jul-01-foundation");
  assert.ok(foundation);
  assert.equal(foundation.category, "milestone");
});
