import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateVerticalPitchCoordinates } from "../../src/app/(main)/temporada/partidos/[id]/tactical-vertical-math.ts";

test("calculateVerticalPitchCoordinates places goalkeeper centrally near bottom goal", () => {
  // Goalkeeper: central (x=0.5), deep defending bottom goal (y=0.1)
  const coords = calculateVerticalPitchCoordinates(0.5, 0.1);
  assert.equal(coords.pitchX, 50);
  assert.ok(coords.pitchY >= 78 && coords.pitchY <= 86, `Expected GK Y near bottom, got ${coords.pitchY}`);
});

test("calculateVerticalPitchCoordinates places left and right backs symmetrically", () => {
  // Left-back: FotMob x ~ 0.85, y ~ 0.25
  const leftBack = calculateVerticalPitchCoordinates(0.85, 0.25);
  // Right-back: FotMob x ~ 0.15, y ~ 0.25
  const rightBack = calculateVerticalPitchCoordinates(0.15, 0.25);

  // Both should be on the same defensive longitudinal line
  assert.equal(leftBack.pitchY, rightBack.pitchY);
  // Left-back on screen left (< 50) and Right-back on screen right (> 50)
  assert.ok(leftBack.pitchX < 35, `Expected left-back on screen left, got ${leftBack.pitchX}`);
  assert.ok(rightBack.pitchX > 65, `Expected right-back on screen right, got ${rightBack.pitchX}`);
  // Symmetrical distance from center (50)
  const leftDist = 50 - leftBack.pitchX;
  const rightDist = rightBack.pitchX - 50;
  assert.ok(Math.abs(leftDist - rightDist) < 0.1, `Expected symmetrical spacing, got ${leftDist} vs ${rightDist}`);
});

test("calculateVerticalPitchCoordinates places striker near top attacking goal", () => {
  // Striker: central (x=0.5), attacking top goal (y=0.85)
  const striker = calculateVerticalPitchCoordinates(0.5, 0.85);
  assert.equal(striker.pitchX, 50);
  assert.ok(striker.pitchY >= 18 && striker.pitchY <= 28, `Expected striker Y near top, got ${striker.pitchY}`);
});

test("calculateVerticalPitchCoordinates handles boundary clamps and fallback values safely", () => {
  const fallback = calculateVerticalPitchCoordinates(Number.NaN, Number.NaN);
  assert.equal(fallback.pitchX, 50);
  assert.equal(fallback.pitchY, 50);

  const extremeMin = calculateVerticalPitchCoordinates(-5, -5);
  assert.ok(extremeMin.pitchX >= 14 && extremeMin.pitchX <= 86);
  assert.ok(extremeMin.pitchY >= 14 && extremeMin.pitchY <= 88);

  const extremeMax = calculateVerticalPitchCoordinates(10, 10);
  assert.ok(extremeMax.pitchX >= 14 && extremeMax.pitchX <= 86);
  assert.ok(extremeMax.pitchY >= 14 && extremeMax.pitchY <= 88);
});
