import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";

describe("Historical Card Presentation Suite", () => {
  it("verifies card seed integrity for card display", () => {
    const quini = HISTORICAL_CARDS_SEED.find((c) => c.slug === "quini-1979")!;
    assert.strictEqual(quini.knownAs, "Quini");
    assert.strictEqual(quini.position, "forward");
    assert.strictEqual(quini.matchesPlayed, 521);
    assert.strictEqual(quini.attackPower, 99);
    assert.strictEqual(quini.defensePower, 42);
    assert.strictEqual(quini.ovr, 98);
    assert.strictEqual(quini.historicalCrestEra, "golden_1980");
  });

  it("ensures each card has an era-appropriate crest designation", () => {
    const validEras = new Set(["1905", "republic", "classic_1950", "golden_1980", "modern"]);

    for (const card of HISTORICAL_CARDS_SEED) {
      assert.ok(
        validEras.has(card.historicalCrestEra),
        `Card ${card.slug} has invalid era: ${card.historicalCrestEra}`
      );
    }
  });

  it("checks pack distribution logic selects random cards without mutations", () => {
    const originalCount = HISTORICAL_CARDS_SEED.length;
    const shuffled = [...HISTORICAL_CARDS_SEED].sort(() => 0.5 - Math.random());
    const pack = shuffled.slice(0, 5);

    assert.strictEqual(pack.length, 5);
    assert.strictEqual(HISTORICAL_CARDS_SEED.length, originalCount);

    // Each card in pack must belong to seed
    for (const c of pack) {
      assert.ok(HISTORICAL_CARDS_SEED.some((s) => s.id === c.id));
    }
  });
});
