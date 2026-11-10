import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TACTICAL_FORMATIONS } from "../../src/lib/lineup-builder/formations.ts";
import {
  comparePitchSlotsBottomToTopRightToLeft,
  findNextSlotBottomToTop,
} from "../../src/lib/lineup-builder/slot-ordering.ts";
import type { PitchAssignedPlayer } from "../../src/lib/lineup-builder/types.ts";

describe("Tactical Slot Ordering Suite (Bottom-to-Top, Right-to-Left)", () => {
  it("sorts 4-2-3-1 formation slots canonically from bottom to top and right to left", () => {
    const formation = TACTICAL_FORMATIONS["4-2-3-1"];
    const slots: PitchAssignedPlayer[] = formation.slots.map((s) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: s.defaultCoord,
      player: null,
    }));

    const sortedSlots = [...slots].sort((a, b) =>
      comparePitchSlotsBottomToTopRightToLeft(a.coord, b.coord)
    );

    const slotIds = sortedSlots.map((s) => s.slotId);

    // 1. Goalkeeper (y = 88)
    assert.equal(slotIds[0], "s-por");

    // 2. Defense line (y ~ 69-71): LD -> DFC2 -> DFC1 -> LI (x: 84 -> 62 -> 38 -> 16)
    assert.equal(slotIds[1], "s-ld");
    assert.equal(slotIds[2], "s-dfc2");
    assert.equal(slotIds[3], "s-dfc1");
    assert.equal(slotIds[4], "s-li");

    // 3. Pivots line (y = 53): MCD2 -> MCD1 (x: 64 -> 36)
    assert.equal(slotIds[5], "s-mcd2");
    assert.equal(slotIds[6], "s-mcd1");

    // 4. Attacking line (y ~ 34-36): ED -> MCO -> EI (x: 82 -> 50 -> 18)
    assert.equal(slotIds[7], "s-ed");
    assert.equal(slotIds[8], "s-mco");
    assert.equal(slotIds[9], "s-ei");

    // 5. Striker (y = 16): DC (x: 50)
    assert.equal(slotIds[10], "s-dc");
  });

  it("findNextSlotBottomToTop selects next slot in sequence when current slot is filled", () => {
    const formation = TACTICAL_FORMATIONS["4-2-3-1"];
    const slots: PitchAssignedPlayer[] = formation.slots.map((s) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: s.defaultCoord,
      player: null,
    }));

    // Start with goalkeeper selected and filling it
    const nextAfterGk = findNextSlotBottomToTop(slots, "s-por");
    assert.equal(nextAfterGk, "s-ld");

    // When right back is filled, next is right center back
    const nextAfterRb = findNextSlotBottomToTop(slots, "s-ld");
    assert.equal(nextAfterRb, "s-por"); // Since gk wasn't marked filled in dummy array

    // Mark goalkeeper as filled
    slots[0] = { ...slots[0], player: { id: "p1" } as unknown as PitchAssignedPlayer["player"] };
    const nextAfterRbWithGkFilled = findNextSlotBottomToTop(slots, "s-ld");
    assert.equal(nextAfterRbWithGkFilled, "s-dfc2");
  });

  it("returns null when all slots are filled", () => {
    const formation = TACTICAL_FORMATIONS["4-4-2"];
    const allFilled: PitchAssignedPlayer[] = formation.slots.map((s) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: s.defaultCoord,
      player: { id: `player-${s.id}` } as unknown as PitchAssignedPlayer["player"],
    }));

    const next = findNextSlotBottomToTop(allFilled, "s-dc2");
    assert.equal(next, null);
  });
});
