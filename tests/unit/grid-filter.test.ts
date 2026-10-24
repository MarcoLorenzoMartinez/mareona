import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GRID_FILTER_STATE,
  filterGridCards,
  sortGridCards,
  type GridFilterState,
} from "../../src/app/(main)/juegos/album/grid-filter-types.ts";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";

describe("Grid Filter & Sorting Suite", () => {
  // Mock status where all cards are owned with quantity 1 (except Quini with quantity 2)
  const getCardStatus = (slug: string) => ({
    isOwned: true,
    quantity: slug.includes("quini") ? 2 : 1,
  });

  it("filters duplicates accurately", () => {
    const state: GridFilterState = {
      ...DEFAULT_GRID_FILTER_STATE,
      selectedCategories: new Set(["duplicates"]),
    };

    const results = filterGridCards(HISTORICAL_CARDS_SEED, state, getCardStatus);
    assert.ok(results.length > 0);
    assert.ok(results.every((c) => c.slug.includes("quini")));
  });

  it("supports multiselect of decades (e.g. 1970s and 1980s)", () => {
    const state: GridFilterState = {
      ...DEFAULT_GRID_FILTER_STATE,
      selectedDecades: new Set(["1970s", "1980s"]),
    };

    const results = filterGridCards(HISTORICAL_CARDS_SEED, state, getCardStatus);
    assert.ok(results.length > 0);
    assert.ok(
      results.every(
        (c) => c.kind === "player" && (c.decade === "1970s" || c.decade === "1980s")
      )
    );
  });

  it("filters cards by minimum rating (OVR threshold)", () => {
    const state: GridFilterState = {
      ...DEFAULT_GRID_FILTER_STATE,
      minRating: 85,
    };

    const results = filterGridCards(HISTORICAL_CARDS_SEED, state, getCardStatus);
    assert.ok(results.length > 0);
    assert.ok(results.every((c) => c.kind === "player" && (c.ovr ?? 0) >= 85));
  });

  it("filters cards within a specific rating range (e.g. 75 to 80)", () => {
    const state: GridFilterState = {
      ...DEFAULT_GRID_FILTER_STATE,
      minRating: 75,
      maxRating: 80,
    };

    const results = filterGridCards(HISTORICAL_CARDS_SEED, state, getCardStatus);
    assert.ok(results.length > 0);
    assert.ok(
      results.every((c) => {
        const ovr = c.ovr ?? 0;
        return c.kind === "player" && ovr >= 75 && ovr <= 80;
      })
    );
  });

  it("sorts cards by OVR descending (highest rated first)", () => {
    const players = HISTORICAL_CARDS_SEED.filter((c) => c.kind === "player");
    const sorted = sortGridCards(players, "ovr", "desc");

    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i].ovr ?? 0;
      const next = sorted[i + 1].ovr ?? 0;
      assert.ok(cur >= next, `Expected ${cur} >= ${next} at index ${i}`);
    }
  });

  it("sorts cards by attack rating ascending and descending", () => {
    const players = HISTORICAL_CARDS_SEED.filter((c) => c.kind === "player");
    const sortedDesc = sortGridCards(players, "attack", "desc");
    assert.ok((sortedDesc[0].attackPower ?? 0) >= (sortedDesc[1].attackPower ?? 0));

    const sortedAsc = sortGridCards(players, "attack", "asc");
    assert.ok((sortedAsc[0].attackPower ?? 0) <= (sortedAsc[1].attackPower ?? 0));
  });

  it("sorts cards by matches played (PJ)", () => {
    const players = HISTORICAL_CARDS_SEED.filter((c) => c.kind === "player");
    const sorted = sortGridCards(players, "matches", "desc");
    assert.ok((sorted[0].matchesPlayed ?? 0) >= (sorted[1].matchesPlayed ?? 0));
  });

  it("sorts cards alphabetically by name", () => {
    const sorted = sortGridCards(HISTORICAL_CARDS_SEED, "name", "asc");
    assert.ok(sorted[0].knownAs.localeCompare(sorted[1].knownAs) <= 0);
  });
});
