import test from "node:test";
import assert from "node:assert/strict";
import {
  getMatchdayDateRange,
  formatMatchDate,
  formatMatchTime,
} from "../../src/lib/sports-api/dates.ts";

test("getMatchdayDateRange correctly calculates 15/18 Jan when given Sunday 17 Jan 2027", () => {
  // Sunday 17 Jan 2027
  const sunday = new Date("2027-01-17T20:00:00Z");
  const { start, end } = getMatchdayDateRange(sunday);

  assert.equal(start.getDate(), 15);
  assert.equal(end.getDate(), 18);
});

test("formatMatchDate outputs 15/18 ene 2027 for unconfirmed match with includeYear = true", () => {
  const result = formatMatchDate("2027-01-17T20:00:00Z", false, true);
  assert.equal(result, "15/18 ene 2027");
});

test("formatMatchDate outputs 15/18 ene for unconfirmed match without year", () => {
  const result = formatMatchDate("2027-01-17T20:00:00Z", false, false);
  assert.equal(result, "15/18 ene");
});

test("formatMatchDate outputs confirmed weekday and day when isTimeConfirmed is true", () => {
  const result = formatMatchDate("2026-10-17T16:30:00Z", true, false);
  // Saturday 17 Oct
  assert.match(result, /sáb/i);
  assert.match(result, /17/);
  assert.match(result, /oct/i);
});

test("formatMatchTime formats valid Madrid time", () => {
  // 16:30 UTC is 18:30 CEST in October
  const time = formatMatchTime("2026-10-17T16:30:00Z");
  assert.equal(time, "18:30");
});

test("getMatchdayDateRange handles midweek matchday correctly", () => {
  // Wednesday 21 Oct 2026
  const wednesday = new Date("2026-10-21T19:00:00Z");
  const { start, end } = getMatchdayDateRange(wednesday);

  assert.equal(start.getDate(), 20); // Tuesday
  assert.equal(end.getDate(), 22); // Thursday
});
