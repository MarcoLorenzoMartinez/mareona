import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTodayDateString,
  DEFAULT_PACK_INVENTORY,
  DUPLICATES_RECIPE_COST,
  loadUserPackInventory,
  loadUserCardInventory,
  claimDailyLoginPack,
} from "../../src/lib/cards/pack-storage.ts";

describe("Pack Storage & Missions Logic", () => {
  it("formats dates as canonical YYYY-MM-DD", () => {
    const fixed = new Date(2026, 9, 29); // Oct 29, 2026
    const str = getTodayDateString(fixed);
    assert.equal(str, "2026-10-29");
  });

  it("provides canonical default pack inventory for new users", () => {
    assert.equal(DEFAULT_PACK_INVENTORY.aficionado, 1);
    assert.equal(DEFAULT_PACK_INVENTORY.rojiblanco, 1);
    assert.equal(DEFAULT_PACK_INVENTORY.leyenda, 0);
  });

  it("defines canonical recycling cost of 10 duplicates for 1 pack", () => {
    assert.equal(DUPLICATES_RECIPE_COST, 10);
  });

  it("requires session for packs inventory and returns 0 packs for guests", () => {
    const guestInventory = loadUserPackInventory(undefined);
    assert.equal(guestInventory.aficionado, 0);
    assert.equal(guestInventory.rojiblanco, 0);
    assert.equal(guestInventory.leyenda, 0);
  });

  it("returns empty card inventory for guests to prevent orphan cards", () => {
    const guestCards = loadUserCardInventory(undefined);
    assert.deepEqual(guestCards, {});
  });

  it("rejects claiming daily packs when user has not authenticated", () => {
    const claimResult = claimDailyLoginPack(undefined);
    assert.equal(claimResult.success, false);
    assert.equal(claimResult.reason, "auth_required");
  });

  it("provisions the 2 canonical welcome packs upon authenticated session initialization", () => {
    const userInventory = loadUserPackInventory("user-authenticated-123");
    assert.equal(userInventory.aficionado, 1);
    assert.equal(userInventory.rojiblanco, 1);
    assert.equal(userInventory.leyenda, 0);
  });
});
