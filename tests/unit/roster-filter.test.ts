import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTargetPositionFromRole,
  filterAndSortRosterPlayers,
  calculateDividerIndex,
} from "../../src/lib/lineup-builder/roster-filter.ts";
import type { LineupPlayer } from "../../src/lib/lineup-builder/types.ts";

describe("Roster Filter & Prioritization Engine", () => {
  const mockPlayers: LineupPlayer[] = [
    {
      id: "gk-1",
      displayName: "Rubén Yáñez",
      fullName: "Rubén Yáñez Alabart",
      shirtNumber: 1,
      defaultPosition: "POR",
      category: "first_team",
      photoUrl: null,
    },
    {
      id: "def-1",
      displayName: "Rosas",
      fullName: "Guillermo Rosas",
      shirtNumber: 2,
      defaultPosition: "DEF",
      category: "first_team",
      photoUrl: null,
    },
    {
      id: "med-1",
      displayName: "Nacho Méndez",
      fullName: "Ignacio Méndez Sánchez",
      shirtNumber: 10,
      defaultPosition: "MED",
      category: "first_team",
      photoUrl: null,
    },
    {
      id: "del-1",
      displayName: "Otero",
      fullName: "Juan Ferney Otero",
      shirtNumber: 19,
      defaultPosition: "DEL",
      category: "first_team",
      photoUrl: null,
    },
  ];

  it("maps granular tactical positions to macro lines", () => {
    assert.equal(getTargetPositionFromRole("POR"), "POR");
    assert.equal(getTargetPositionFromRole("LI"), "DEF");
    assert.equal(getTargetPositionFromRole("DFC"), "DEF");
    assert.equal(getTargetPositionFromRole("MCD"), "MED");
    assert.equal(getTargetPositionFromRole("MCO"), "MED");
    assert.equal(getTargetPositionFromRole("EI"), "MED");
    assert.equal(getTargetPositionFromRole("ED"), "MED");
    assert.equal(getTargetPositionFromRole("MI"), "MED");
    assert.equal(getTargetPositionFromRole("MD"), "MED");
    assert.equal(getTargetPositionFromRole("DC"), "DEL");
    assert.equal(getTargetPositionFromRole(null), null);
  });

  it("prioritizes players matching the targeted role", () => {
    const sorted = filterAndSortRosterPlayers({
      players: mockPlayers,
      assignedPlayerIds: new Set(),
      selectedCategory: "all",
      selectedPosition: "all",
      searchQuery: "",
      targetPosition: "DEL",
    });

    assert.equal(sorted[0].id, "del-1");
  });

  it("calculates divider index between targeted and other lines", () => {
    const sorted = filterAndSortRosterPlayers({
      players: mockPlayers,
      assignedPlayerIds: new Set(),
      selectedCategory: "all",
      selectedPosition: "all",
      searchQuery: "",
      targetPosition: "DEL",
    });

    const divider = calculateDividerIndex(sorted, "DEL", "all");
    assert.equal(divider, 1);
  });

  it("filters players by text query matching name or shirt number", () => {
    const byName = filterAndSortRosterPlayers({
      players: mockPlayers,
      assignedPlayerIds: new Set(),
      selectedCategory: "all",
      selectedPosition: "all",
      searchQuery: "mendez",
      targetPosition: null,
    });
    assert.equal(byName.length, 1);
    assert.equal(byName[0].id, "med-1");

    const byNumber = filterAndSortRosterPlayers({
      players: mockPlayers,
      assignedPlayerIds: new Set(),
      selectedCategory: "all",
      selectedPosition: "all",
      searchQuery: "19",
      targetPosition: null,
    });
    assert.equal(byNumber.length, 1);
    assert.equal(byNumber[0].id, "del-1");
  });
});
