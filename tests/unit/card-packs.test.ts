import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PACK_TIERS, generatePackCards } from "../../src/lib/cards/packs.ts";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";

describe("Card Pack Engine & Tiers", () => {
  it("defines canonical tier configs with correct card counts", () => {
    assert.equal(PACK_TIERS.aficionado.cardCount, 2);
    assert.equal(PACK_TIERS.rojiblanco.cardCount, 3);
    assert.equal(PACK_TIERS.leyenda.cardCount, 5);

    assert.equal(PACK_TIERS.rojiblanco.minOvrGuaranteed, 75);
    assert.equal(PACK_TIERS.leyenda.minOvrGuaranteed, 82);
    assert.equal(PACK_TIERS.leyenda.legendGuaranteed, true);
  });

  it("generates exactly 2 distinct cards for Sobre Aficionado", () => {
    const cards = generatePackCards("aficionado", HISTORICAL_CARDS_SEED);
    assert.equal(cards.length, 2);
    assert.notEqual(cards[0]?.slug, cards[1]?.slug);
  });

  it("generates 3 cards for Sobre Rojiblanco with at least 1 OVR >= 75", () => {
    for (let i = 0; i < 5; i++) {
      const cards = generatePackCards("rojiblanco", HISTORICAL_CARDS_SEED);
      assert.equal(cards.length, 3);
      const uniqueSlugs = new Set(cards.map((c) => c.slug));
      assert.equal(uniqueSlugs.size, 3);

      const hasQualityCard = cards.some((c) => (c.ovr ?? 0) >= 75);
      assert.equal(hasQualityCard, true, "Sobre Rojiblanco must guarantee at least one OVR >= 75");
    }
  });

  it("generates 5 cards for Sobre Leyenda with guaranteed legend OVR >= 82", () => {
    for (let i = 0; i < 5; i++) {
      const cards = generatePackCards("leyenda", HISTORICAL_CARDS_SEED);
      assert.equal(cards.length, 5);
      const uniqueSlugs = new Set(cards.map((c) => c.slug));
      assert.equal(uniqueSlugs.size, 5);

      const hasLegend = cards.some((c) => (c.ovr ?? 0) >= 82);
      assert.equal(hasLegend, true, "Sobre Leyenda must guarantee at least one legend with OVR >= 82");
    }
  });

  it("prioritizes unowned legends in Sobre Leyenda duplicate protection", () => {
    const allLegends = HISTORICAL_CARDS_SEED.filter((c) => (c.ovr ?? 0) >= 82);
    assert.ok(allLegends.length > 2, "There must be multiple legends in catalog");

    const targetUnowned = allLegends[0]!;
    const ownedSlugs = new Set(allLegends.slice(1).map((c) => c.slug));

    const cards = generatePackCards("leyenda", HISTORICAL_CARDS_SEED, ownedSlugs);
    const hasTargetUnowned = cards.some((c) => c.slug === targetUnowned.slug);
    assert.equal(hasTargetUnowned, true, "Anti-repeat protection must pick unowned legend");
  });
});
