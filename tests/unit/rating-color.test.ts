import test from "node:test";
import assert from "node:assert/strict";
import { getRatingBadgeStyle } from "../../src/app/(main)/temporada/partidos/[id]/rating-color.ts";

test("getRatingBadgeStyle assigns correct semantic colors across the scale", () => {
  // Outstanding: >= 8.0
  const outstanding = getRatingBadgeStyle(8.2);
  assert.equal(outstanding.bg, "bg-emerald-600");
  assert.equal(outstanding.text, "text-white");

  // Good: 7.0 - 7.9
  const good = getRatingBadgeStyle(7.4);
  assert.equal(good.bg, "bg-green-600");
  assert.equal(good.text, "text-white");

  // Average: 6.0 - 6.9
  const average = getRatingBadgeStyle(6.5);
  assert.equal(average.bg, "bg-amber-500");
  assert.equal(average.text, "text-neutral-950");

  // Poor: < 6.0
  const poor = getRatingBadgeStyle(5.8);
  assert.equal(poor.bg, "bg-rose-600");
  assert.equal(poor.text, "text-white");
});
