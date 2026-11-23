import test from "node:test";
import assert from "node:assert/strict";
import type { HistoricalChartPoint } from "../../src/lib/historical/types.ts";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  clientToSvgCoords,
  computeChartPointCoords,
  findNearestChartPoint,
} from "../../src/app/(main)/historico/evolution-chart-math.ts";

function makePoint(year: number, effectiveRank: number): HistoricalChartPoint {
  return {
    year,
    seasonLabel: `${year}-${String((year + 1) % 100).padStart(2, "0")}`,
    tier: effectiveRank <= 20 ? 1 : 2,
    position: effectiveRank <= 20 ? effectiveRank : effectiveRank - 20,
    effectiveRank,
    isMilestone: false,
  };
}

test("findNearestChartPoint selects exact year even when adjacent year has same rank", () => {
  // Build a realistic ~98-year span where consecutive years are ~8.7 SVG units apart
  const points: HistoricalChartPoint[] = [];
  for (let yr = 1928; yr <= 2025; yr++) {
    points.push(makePoint(yr, 10));
  }
  const coords = computeChartPointCoords(points);
  const target1980 = coords.find((c) => c.point.year === 1980)!;
  const target1981 = coords.find((c) => c.point.year === 1981)!;

  // Clicking directly on 1980's center must select 1980, not 1981
  const hit1980 = findNearestChartPoint(coords, target1980.cx, target1980.cy);
  assert.equal(hit1980?.point.seasonLabel, "1980-81");

  // Clicking slightly to the left of the midpoint between 1980 and 1981 selects 1980
  const midX = (target1980.cx + target1981.cx) / 2;
  const hitLeft = findNearestChartPoint(coords, midX - 0.5, target1980.cy);
  assert.equal(hitLeft?.point.seasonLabel, "1980-81");

  // Clicking slightly to the right of the midpoint selects 1981
  const hitRight = findNearestChartPoint(coords, midX + 0.5, target1981.cy);
  assert.equal(hitRight?.point.seasonLabel, "1981-82");
});

test("findNearestChartPoint resolves closest point in 2D when clicking between staggered points", () => {
  const points = [
    makePoint(1928, 1),
    makePoint(1979, 2),
    makePoint(1980, 25),
    makePoint(2025, 10),
  ];
  const coords = computeChartPointCoords(points);
  const p1979 = coords[1]!;
  const p1980 = coords[2]!;

  // Click near p1979's Y level even if X is slightly closer to p1980's X
  const hitUpper = findNearestChartPoint(coords, p1980.cx, p1979.cy + 2);
  assert.equal(hitUpper?.point.seasonLabel, "1979-80");

  // Click near p1980's Y level
  const hitLower = findNearestChartPoint(coords, p1979.cx, p1980.cy - 2);
  assert.equal(hitLower?.point.seasonLabel, "1980-81");
});

test("findNearestChartPoint returns null when clicking far outside any point", () => {
  const points = [makePoint(1928, 10), makePoint(2025, 10)];
  const coords = computeChartPointCoords(points);

  const miss = findNearestChartPoint(coords, CHART_WIDTH / 2, CHART_HEIGHT / 2);
  assert.equal(miss, null);
});

test("clientToSvgCoords scales viewport coordinates accurately to SVG viewBox", () => {
  const scaled = clientToSvgCoords(360, 110, {
    left: 10,
    top: 10,
    width: 700,
    height: 200,
  });

  assert.deepEqual(scaled, {
    x: (350 / 700) * CHART_WIDTH,
    y: (100 / 200) * CHART_HEIGHT,
  });

  assert.equal(clientToSvgCoords(0, 0, { left: 0, top: 0, width: 0, height: 200 }), null);
});
