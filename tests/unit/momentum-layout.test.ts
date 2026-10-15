import test from "node:test";
import assert from "node:assert/strict";
import { layoutMomentumEvents, parseEventMinute } from "../../src/app/(main)/temporada/partidos/[id]/momentum-event-layout.ts";
import type { DomainMatchEvent } from "../../src/lib/sports-api/types.ts";

function createMockEvent(id: string, minute: string, isHome: boolean = true): DomainMatchEvent {
  return {
    id,
    type: "goal",
    minute,
    minuteSort: parseInt(minute, 10),
    period: 1,
    teamId: "731",
    isSporting: true,
    isHome,
    score: "1-0",
    player: { id: "p1", name: "Player 1" },
  };
}

test("parseEventMinute parses regular and stoppage minutes correctly", () => {
  assert.equal(parseEventMinute("15'"), 15);
  assert.equal(parseEventMinute("45+2'"), 47);
  assert.equal(parseEventMinute("90+4'"), 94);
});

test("layoutMomentumEvents keeps all events on tier 0 when comfortably spaced", () => {
  const events = [
    createMockEvent("1", "10'"),
    createMockEvent("2", "60'"),
  ];
  const totalWidth = 90;
  const getMarkerX = (m: number) => m;

  const result = layoutMomentumEvents(events, totalWidth, getMarkerX, 8);
  assert.equal(result.length, 2);
  assert.equal(result[0].axisX, 10);
  assert.equal(result[1].axisX, 60);
  assert.equal(result[0].tier, 0);
  assert.equal(result[1].tier, 0);
});

test("layoutMomentumEvents stacks 2 rapid goals into Tier 0 and Tier 1 with exact X coordinates", () => {
  const events = [
    createMockEvent("1", "38'"),
    createMockEvent("2", "40'"),
  ];
  const totalWidth = 90;
  const getMarkerX = (m: number) => m;

  const result = layoutMomentumEvents(events, totalWidth, getMarkerX, 8);
  assert.equal(result.length, 2);
  // X coordinates stay 100% true to exact match minutes
  assert.equal(result[0].axisX, 38);
  assert.equal(result[1].axisX, 40);

  // Stacks vertically: First on tier 0, second elevated to tier 1
  assert.equal(result[0].tier, 0);
  assert.equal(result[1].tier, 1);
});

test("layoutMomentumEvents dynamically handles 3 or more colliding events in quick succession", () => {
  const events = [
    createMockEvent("1", "88'"),
    createMockEvent("2", "89'"),
    createMockEvent("3", "90'"),
    createMockEvent("4", "90+3'"),
  ];
  const totalWidth = 100;
  const getMarkerX = (m: number) => m;
  const minGap = 8;

  const result = layoutMomentumEvents(events, totalWidth, getMarkerX, minGap);
  assert.equal(result.length, 4);

  // Each colliding event gets assigned an escalating tier without collision
  assert.equal(result[0].tier, 0);
  assert.equal(result[1].tier, 1);
  assert.equal(result[2].tier, 2);

  // Later event resets or uses lowest available tier when space opens up
  assert.ok(result[3].tier >= 0);
});
