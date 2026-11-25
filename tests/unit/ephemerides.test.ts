import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import rawEphemerides from "../../src/data/historical/ephemerides.json" with { type: "json" };
import {
  getEphemeridesForDay,
  formatDayMonthLabel,
} from "../../src/lib/historical/ephemerides-service.ts";
import { pickFeaturedEphemeris } from "../../src/lib/historical/featured-ephemeris.ts";
import type { EphemerisMilestone } from "../../src/lib/historical/ephemerides-types.ts";

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

test("all local ephemeris photoUrl assets exist on disk under public/", () => {
  const milestones = rawEphemerides as readonly EphemerisMilestone[];
  for (const item of milestones) {
    if (!item.photoUrl || !item.photoUrl.startsWith("/")) continue;
    const relativePath = item.photoUrl.replace(/^\/+/, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);
    assert.ok(fs.existsSync(fullPath), `Missing local ephemeris asset: ${item.photoUrl} (${item.id})`);
  }
});

test("getEphemeridesForDay resolves verified local photos for player and coach milestones", () => {
  const nov25 = getEphemeridesForDay(11, 25);
  const tomas = nov25.milestones.find((m) => m.id === "eph-nov-25-tomas-birth");
  assert.ok(tomas);
  assert.equal(tomas.photoUrl, "/images/cards/historical/bdf-2553.jpg");

  const featuredNov25 = pickFeaturedEphemeris(nov25);
  assert.ok(featuredNov25);
  assert.equal(featuredNov25.isMatch, false);
  assert.equal(featuredNov25.photoUrl, "/images/cards/historical/bdf-2553.jpg");

  const aug28 = getEphemeridesForDay(8, 28);
  const preciado = aug28.milestones.find((m) => m.id === "eph-aug-28-preciado-birth");
  assert.ok(preciado);
  assert.equal(preciado.photoUrl, "/images/cards/historical/bdf-coach-3891.jpg");

  const jan1 = getEphemeridesForDay(1, 1);
  const novoa = jan1.milestones.find((m) => m.id === "eph-jan-01-novoa-birth");
  assert.ok(novoa);
  assert.equal(novoa.photoUrl, "/images/cards/historical/bdf-coach-2157.jpg");
});

test("getEphemeridesForDay and pickFeaturedEphemeris work cleanly across all calendar days", () => {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysInMonth[month - 1]!; day++) {
      const result = getEphemeridesForDay(month, day);
      const featured = pickFeaturedEphemeris(result);
      if (result.milestones.length > 0 || result.matches.length > 0) {
        assert.ok(featured, `Expected featured ephemeris on ${day}/${month}`);
        assert.ok(featured.title.length > 0);
      }
    }
  }
});
