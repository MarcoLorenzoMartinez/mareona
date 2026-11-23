import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  savePersistedLineup,
  loadPersistedLineup,
  clearPersistedLineup,
  restoreSlotsWithRoster,
  LINEUP_STORAGE_KEY,
  type PersistedSlotData,
} from "../../src/lib/lineup-builder/lineup-storage.ts";
import {
  loadLocalSharedLineup,
  SHARED_LINEUP_STORAGE_KEY,
} from "../../src/lib/lineup-builder/shared-lineup-codec.ts";
import { TACTICAL_FORMATIONS } from "../../src/lib/lineup-builder/formations.ts";
import type { LineupPlayer, PitchAssignedPlayer } from "../../src/lib/lineup-builder/types.ts";

describe("Lineup Storage & Persistence Suite", () => {
  // Mock localStorage for Node.js test environment
  const store = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };

  beforeEach(() => {
    store.clear();
    const mockWindow = { localStorage: mockLocalStorage } as unknown as Window & typeof globalThis;
    globalThis.window = mockWindow;
  });

  const mockPlayer: LineupPlayer = {
    id: "731-yanez",
    displayName: "Yáñez",
    fullName: "Rubén Yáñez",
    shirtNumber: 1,
    defaultPosition: "POR",
    category: "first_team",
    photoUrl: "https://example.com/yanez.png",
  };

  it("saves and loads persisted lineup configuration faithfully", () => {
    const defaultFormation = TACTICAL_FORMATIONS["4-2-3-1"];
    const mockAssignedSlots: PitchAssignedPlayer[] = defaultFormation.slots.map((s, i) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: s.defaultCoord,
      player: i === 0 ? mockPlayer : null,
    }));

    savePersistedLineup("4-2-3-1", [], mockAssignedSlots);

    const loaded = loadPersistedLineup();
    assert.ok(loaded);
    assert.equal(loaded.formationKey, "4-2-3-1");
    assert.equal(loaded.slots.length, 11);
    assert.equal(loaded.slots[0].playerId, "731-yanez");
    assert.equal(loaded.slots[1].playerId, null);

    const sharedDraft = loadLocalSharedLineup();
    assert.ok(sharedDraft);
    assert.equal(sharedDraft.formationKey, "4-2-3-1");
    assert.equal(sharedDraft.starters.length, 11);
    assert.equal(sharedDraft.starters[0].displayName, "Yáñez");
    assert.equal(sharedDraft.starters[0].shirtNumber, 1);
  });

  it("synchronizes formation and moved coordinates to shared lineup draft on save", () => {
    const formation = TACTICAL_FORMATIONS["4-4-2"];
    const customSlots: PitchAssignedPlayer[] = formation.slots.map((s, i) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: i === 1 ? { x: 22.4, y: 61.8 } : s.defaultCoord,
      player: i === 0 ? mockPlayer : null,
    }));

    savePersistedLineup("4-4-2", [], customSlots);

    const sharedDraft = loadLocalSharedLineup();
    assert.ok(sharedDraft);
    assert.equal(sharedDraft.formationKey, "4-4-2");
    assert.equal(sharedDraft.starters[0].displayName, "Yáñez");
    assert.equal(sharedDraft.starters[1].coord.x, 22.4);
    assert.equal(sharedDraft.starters[1].coord.y, 61.8);
  });

  it("handles corrupted or malformed localStorage payload gracefully", () => {
    mockLocalStorage.setItem(LINEUP_STORAGE_KEY, "{ broken json ... ");
    assert.equal(loadPersistedLineup(), null);

    mockLocalStorage.setItem(LINEUP_STORAGE_KEY, JSON.stringify({ formationKey: "invalid-key" }));
    assert.equal(loadPersistedLineup(), null);

    mockLocalStorage.setItem(LINEUP_STORAGE_KEY, JSON.stringify({ formationKey: "4-4-2", slots: [] }));
    assert.equal(loadPersistedLineup(), null);
  });

  it("clears persisted lineup and shared lineup draft completely", () => {
    mockLocalStorage.setItem(LINEUP_STORAGE_KEY, JSON.stringify({ formationKey: "4-4-2" }));
    mockLocalStorage.setItem(SHARED_LINEUP_STORAGE_KEY, JSON.stringify({ formationKey: "4-4-2", starters: [] }));
    clearPersistedLineup();
    assert.equal(mockLocalStorage.getItem(LINEUP_STORAGE_KEY), null);
    assert.equal(mockLocalStorage.getItem(SHARED_LINEUP_STORAGE_KEY), null);
  });

  it("restores slots matching player IDs against fresh roster pool", () => {
    const savedSlots: PersistedSlotData[] = [
      {
        slotId: "s-por",
        role: "POR",
        coord: { x: 50, y: 88 },
        playerId: "731-yanez",
      },
      {
        slotId: "s-ld",
        role: "LD",
        coord: { x: 84, y: 69 },
        playerId: "missing-id",
      },
      {
        slotId: "s-li",
        role: "LI",
        coord: { x: 16, y: 69 },
        playerId: null,
      },
    ];

    const restored = restoreSlotsWithRoster(savedSlots, [mockPlayer]);
    assert.equal(restored.length, 3);
    assert.equal(restored[0].player?.displayName, "Yáñez");
    assert.equal(restored[1].player, null);
    assert.equal(restored[2].player, null);
  });
});
