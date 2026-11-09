import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getPointsForDateRange,
  getPointsForPeriod,
  shouldShowLabel,
} from "../../src/app/admin/estadisticas/traffic-period-data.ts";
import type { DailyTrafficPoint } from "../../src/lib/admin/types.ts";

const MOCK_BASE_14: readonly DailyTrafficPoint[] = [
  { date: "2026-10-27", label: "27 Oct", visits: 1100, uniqueVisitors: 750, isMatchDay: false },
  { date: "2026-10-28", label: "28 Oct", visits: 1250, uniqueVisitors: 820, isMatchDay: false },
  { date: "2026-11-01", label: "1 Nov", visits: 3100, uniqueVisitors: 2100, isMatchDay: true },
  { date: "2026-11-08", label: "8 Nov", visits: 3450, uniqueVisitors: 2320, isMatchDay: true },
  { date: "2026-11-09", label: "9 Nov", visits: 1940, uniqueVisitors: 1310, isMatchDay: false },
];

describe("Admin Traffic Data & Range Engine", () => {
  it("returns base 14 points for 14d period", () => {
    const points = getPointsForPeriod(MOCK_BASE_14, "14d");
    assert.equal(points.length, 5);
  });

  it("generates 30 days of data for 30d period", () => {
    const points = getPointsForPeriod(MOCK_BASE_14, "30d");
    assert.equal(points.length, 30);
  });

  it("returns custom date range points correctly", () => {
    const points = getPointsForDateRange(MOCK_BASE_14, "2026-11-01", "2026-11-05");
    assert.equal(points.length, 5);
    assert.equal(points[0].date, "2026-11-01");
    assert.equal(points[points.length - 1].date, "2026-11-05");
    // Reuses base points where available
    assert.equal(points[0].visits, 3100);
    assert.equal(points[0].isMatchDay, true);
  });

  it("handles inverted dates gracefully by sorting them", () => {
    const points = getPointsForDateRange(MOCK_BASE_14, "2026-11-05", "2026-11-01");
    assert.equal(points.length, 5);
    assert.equal(points[0].date, "2026-11-01");
  });

  it("controls X-axis label density according to total points", () => {
    // 6m and 1y always show labels
    assert.equal(shouldShowLabel("6m", 0, 6), true);
    assert.equal(shouldShowLabel("1y", 5, 12), true);

    // Short periods (< 14) show every 2nd
    assert.equal(shouldShowLabel("custom", 0, 10), true);
    assert.equal(shouldShowLabel("custom", 1, 10), false);
    assert.equal(shouldShowLabel("custom", 2, 10), true);
    assert.equal(shouldShowLabel("custom", 9, 10), true); // last point always shown
  });
});
