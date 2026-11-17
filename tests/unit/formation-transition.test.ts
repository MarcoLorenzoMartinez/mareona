import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { remapSlotsForNewFormation } from "../../src/lib/lineup-builder/formation-transition.ts";
import { TACTICAL_FORMATIONS } from "../../src/lib/lineup-builder/formations.ts";
import type { LineupPlayer, PitchAssignedPlayer, TacticalRole } from "../../src/lib/lineup-builder/types.ts";

function createMockPlayer(
  id: string,
  name: string,
  shirtNumber: number,
  pos: "POR" | "DEF" | "MED" | "DEL",
  naturalRole?: TacticalRole,
  secondaryRoles?: readonly TacticalRole[]
): LineupPlayer {
  return {
    id,
    displayName: name,
    fullName: name,
    shirtNumber,
    defaultPosition: pos,
    naturalRole,
    secondaryRoles,
    category: "first_team",
    photoUrl: null,
  };
}

describe("Player-Centric Tactical Formation Transition Suite", () => {
  const yanez = createMockPlayer("1", "Yáñez", 1, "POR", "POR");
  const cuenca = createMockPlayer("44", "Cuenca", 44, "DEF", "DFC", ["LI"]);
  const vazquez = createMockPlayer("15", "P. Vázquez", 15, "DEF", "DFC");
  const dunabeitia = createMockPlayer("24", "Duñabeitia", 24, "DEF", "DFC");
  const bruno = createMockPlayer("36", "Bruno", 36, "DEF", "DFC");
  const rosas = createMockPlayer("2", "Rosas", 2, "DEF", "LD", ["CAD"]);
  const cote = createMockPlayer("3", "Cote", 3, "DEF", "LI", ["CAI"]);
  const manu = createMockPlayer("8", "Manu R.", 8, "MED", "MC");
  const nacho = createMockPlayer("6", "Nacho M.", 6, "MED", "MCD", ["MC"]);
  const iosifov = createMockPlayer("20", "Iosifov", 20, "MED", "ED", ["EI"]);
  const enol = createMockPlayer("27", "Enol", 27, "DEL", "DC");
  const ferrari = createMockPlayer("9", "Ferrari", 9, "DEL", "DC");

  it("prevents role swapping (Rosas staying LD and Bruno staying DFC) after 4-2-3-1 -> 3-5-2 -> 4-2-3-1 roundtrip", () => {
    // Initial 4-2-3-1 setup with Cuenca at LI, Vázquez and Duñabeitia at DFC, Rosas at LD
    const initial4231: PitchAssignedPlayer[] = [
      { slotId: "s-por", role: "POR", coord: { x: 50, y: 88 }, player: yanez },
      { slotId: "s-li", role: "LI", coord: { x: 16, y: 69 }, player: cuenca },
      { slotId: "s-dfc1", role: "DFC", coord: { x: 38, y: 71 }, player: vazquez },
      { slotId: "s-dfc2", role: "DFC", coord: { x: 62, y: 71 }, player: dunabeitia },
      { slotId: "s-ld", role: "LD", coord: { x: 84, y: 69 }, player: rosas },
      { slotId: "s-mcd1", role: "MCD", coord: { x: 36, y: 53 }, player: manu },
      { slotId: "s-mcd2", role: "MCD", coord: { x: 64, y: 53 }, player: nacho },
      { slotId: "s-ei", role: "EI", coord: { x: 18, y: 34 }, player: iosifov },
      { slotId: "s-mco", role: "MCO", coord: { x: 50, y: 36 }, player: enol },
      { slotId: "s-ed", role: "ED", coord: { x: 82, y: 34 }, player: bruno }, // e.g. Bruno placed as placeholder
      { slotId: "s-dc", role: "DC", coord: { x: 50, y: 16 }, player: ferrari },
    ];

    // Transition 1: 4-2-3-1 -> 3-5-2
    const to352 = remapSlotsForNewFormation(initial4231, "3-5-2");

    // Rosas moves to CAD
    const cadSlot = to352.find((s) => s.slotId === "s-cad");
    assert.equal(cadSlot?.player?.displayName, "Rosas");

    // Cuenca moves to DFC (left center-back)
    const dfcSlotsIn352 = to352.filter((s) => s.role === "DFC");
    const dfcNamesIn352 = dfcSlotsIn352.map((s) => s.player?.displayName);
    assert.ok(dfcNamesIn352.includes("Cuenca"));

    // Transition 2: Return from 3-5-2 -> 4-2-3-1
    const backTo4231 = remapSlotsForNewFormation(to352, "4-2-3-1");

    // Crucial: Rosas MUST return to LD (never swapped to ED)
    const ldSlot = backTo4231.find((s) => s.slotId === "s-ld");
    assert.equal(ldSlot?.player?.displayName, "Rosas", "Rosas must be at LD in 4-2-3-1");

    // Cuenca MUST return to LI (his designated position with memory)
    const liSlot = backTo4231.find((s) => s.slotId === "s-li");
    assert.equal(liSlot?.player?.displayName, "Cuenca", "Cuenca must return to LI in 4-2-3-1");

    // Bruno must NOT be at LD
    assert.notEqual(ldSlot?.player?.displayName, "Bruno");

    // Striker must remain Ferrari
    const dcSlot = backTo4231.find((s) => s.slotId === "s-dc");
    assert.equal(dcSlot?.player?.displayName, "Ferrari");
  });

  it("remaps Cote (natural LI/CAI) to CAI when switching to 3-5-2", () => {
    const initialSlots: PitchAssignedPlayer[] = [
      { slotId: "s-por", role: "POR", coord: { x: 50, y: 88 }, player: yanez },
      { slotId: "s-li", role: "LI", coord: { x: 16, y: 69 }, player: cote },
      { slotId: "s-dfc1", role: "DFC", coord: { x: 38, y: 71 }, player: vazquez },
      { slotId: "s-dfc2", role: "DFC", coord: { x: 62, y: 71 }, player: dunabeitia },
      { slotId: "s-ld", role: "LD", coord: { x: 84, y: 69 }, player: rosas },
      { slotId: "s-mcd1", role: "MCD", coord: { x: 36, y: 53 }, player: manu },
      { slotId: "s-mcd2", role: "MCD", coord: { x: 64, y: 53 }, player: nacho },
      { slotId: "s-ei", role: "EI", coord: { x: 18, y: 34 }, player: iosifov },
      { slotId: "s-mco", role: "MCO", coord: { x: 50, y: 36 }, player: enol },
      { slotId: "s-ed", role: "ED", coord: { x: 82, y: 34 }, player: bruno },
      { slotId: "s-dc", role: "DC", coord: { x: 50, y: 16 }, player: ferrari },
    ];

    const remapped = remapSlotsForNewFormation(initialSlots, "3-5-2");

    const caiSlot = remapped.find((s) => s.slotId === "s-cai");
    assert.equal(caiSlot?.player?.displayName, "Cote");
  });

  it("handles blank or partially filled lineups gracefully without throwing", () => {
    const defaultFormation = TACTICAL_FORMATIONS["4-2-3-1"];
    const emptySlots: PitchAssignedPlayer[] = defaultFormation.slots.map((s) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: s.defaultCoord,
      player: null,
    }));

    const result = remapSlotsForNewFormation(emptySlots, "4-4-2");
    assert.equal(result.length, 11);
    assert.ok(result.every((s) => s.player === null));
  });
});
