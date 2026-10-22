import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cardSchema, openPackInputSchema, duelRoundMoveSchema } from "../../src/lib/cards/schemas.ts";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";
import {
  resolveCardStatComparison,
  validateTacticalFormation,
  FORMATION_REQUIREMENTS,
} from "../../src/lib/cards/combat.ts";
import type { Card } from "../../src/lib/cards/types.ts";

describe("Cards Domain & Seed Suite", () => {
  it("validates all historical seed cards against Zod cardSchema", () => {
    assert.ok(
      HISTORICAL_CARDS_SEED.length >= 450 && HISTORICAL_CARDS_SEED.length <= 550,
      `Expected ~500 cards, got ${HISTORICAL_CARDS_SEED.length}`
    );

    for (const card of HISTORICAL_CARDS_SEED) {
      const parsed = cardSchema.safeParse(card);
      assert.ok(
        parsed.success,
        `Card ${card.slug} failed schema validation: ${JSON.stringify(parsed.error?.issues)}`
      );
    }
  });

  it("includes commemorative crest and moment cards without competitive stats", () => {
    const crests = HISTORICAL_CARDS_SEED.filter((c) => c.kind === "crest");
    const moments = HISTORICAL_CARDS_SEED.filter((c) => c.kind === "moment");

    assert.strictEqual(crests.length, 5, "Expected exactly 5 canonical historical crests");
    const crestPhotos = new Set(crests.map((c) => c.photoUrl));
    assert.strictEqual(crestPhotos.size, 5, "All historical crests must have unique graphical assets without duplicates");
    assert.ok(moments.length >= 10, "Expected at least 10 historical moments");
    const momentPhotos = new Set(moments.map((m) => m.photoUrl));
    assert.strictEqual(
      momentPhotos.size,
      moments.length,
      "All historical moments must have unique, non-duplicated photographic assets"
    );

    for (const crest of crests) {
      assert.strictEqual(crest.position, undefined);
      assert.strictEqual(crest.ovr, undefined);
      assert.ok(crest.eraLabel.length > 0);
    }

    for (const moment of moments) {
      assert.strictEqual(moment.position, undefined);
      assert.strictEqual(moment.ovr, undefined);
      assert.ok(moment.year !== undefined || moment.eraLabel.length > 0);

      const diskPath = path.join(process.cwd(), "public", moment.photoUrl);
      assert.ok(
        fs.existsSync(diskPath),
        `Physical image missing on disk for moment ${moment.knownAs}: ${diskPath}`
      );
      assert.ok(
        fs.statSync(diskPath).size > 1000,
        `Image corrupt or too small for moment ${moment.knownAs}: ${diskPath}`
      );
    }
  });

  it("ensures every decade from 1920s to 2020s is represented in the seed", () => {
    const decades = new Set(HISTORICAL_CARDS_SEED.map((c) => c.decade));
    const expectedDecades = [
      "1920s",
      "1930s",
      "1940s",
      "1950s",
      "1960s",
      "1970s",
      "1980s",
      "1990s",
      "2000s",
      "2010s",
      "2020s",
    ];

    for (const decade of expectedDecades) {
      assert.ok(decades.has(decade as Card["decade"]), `Decade ${decade} is missing in seed`);
    }
  });

  it("ensures all 4 tactical positions are covered with realistic stats", () => {
    const positions = new Set(HISTORICAL_CARDS_SEED.map((c) => c.position));
    assert.ok(positions.has("goalkeeper"));
    assert.ok(positions.has("defender"));
    assert.ok(positions.has("midfielder"));
    assert.ok(positions.has("forward"));

    const quini = HISTORICAL_CARDS_SEED.find((c) => c.slug === "quini-1979");
    assert.ok(quini);
    assert.strictEqual(quini.matchesPlayed, 521);
    assert.strictEqual(quini.attackPower, 99);
    assert.strictEqual(quini.ovr, 98);

    const ablanedo = HISTORICAL_CARDS_SEED.find((c) => c.slug === "ablanedo-ii-1985");
    assert.ok(ablanedo);
    assert.strictEqual(ablanedo.position, "goalkeeper");
    assert.strictEqual(ablanedo.defensePower, 98);
  });

  it("evaluates head-to-head stat comparisons accurately", () => {
    const quini = HISTORICAL_CARDS_SEED.find((c) => c.slug === "quini-1979")!;
    const villa = HISTORICAL_CARDS_SEED.find((c) => c.slug === "david-villa-2002")!;
    const joaquin = HISTORICAL_CARDS_SEED.find((c) => c.slug === "joaquin-alonso-1985")!;
    const ablanedo = HISTORICAL_CARDS_SEED.find((c) => c.slug === "ablanedo-ii-1985")!;

    // Quini (99 ATQ) beats David Villa (95 ATQ)
    assert.strictEqual(resolveCardStatComparison(quini, villa, "attack_power"), "host");

    // Joaquín (649 PJ) beats Quini (521 PJ)
    assert.strictEqual(resolveCardStatComparison(quini, joaquin, "matches_played"), "guest");

    // Ablanedo (98 DEF) beats David Villa (40 DEF)
    assert.strictEqual(resolveCardStatComparison(ablanedo, villa, "defense_power"), "host");
  });

  it("validates tactical formations against slot requirements", () => {
    const req433 = FORMATION_REQUIREMENTS["4-3-3"];
    assert.strictEqual(req433.goalkeepers, 1);
    assert.strictEqual(req433.defenders, 4);
    assert.strictEqual(req433.midfielders, 3);
    assert.strictEqual(req433.forwards, 3);

    // Pick 11 cards to build a valid 4-3-3
    const gk = HISTORICAL_CARDS_SEED.filter((c) => c.position === "goalkeeper").slice(0, 1);
    const def = HISTORICAL_CARDS_SEED.filter((c) => c.position === "defender").slice(0, 4);
    const mid = HISTORICAL_CARDS_SEED.filter((c) => c.position === "midfielder").slice(0, 3);
    const fwd = HISTORICAL_CARDS_SEED.filter((c) => c.position === "forward").slice(0, 3);

    const validLineup: Card[] = [...gk, ...def, ...mid, ...fwd];
    assert.strictEqual(validLineup.length, 11);

    const result = validateTacticalFormation("4-3-3", validLineup);
    assert.ok(result.isValid);

    // Testing invalid lineup (2 goalkeepers and 2 forwards instead of 1 GK and 3 FWD)
    const extraGk = HISTORICAL_CARDS_SEED.filter((c) => c.position === "goalkeeper")[1];
    const invalidLineup = [...validLineup.slice(0, 10), extraGk];
    const invalidResult = validateTacticalFormation("4-3-3", invalidLineup);
    assert.strictEqual(invalidResult.isValid, false);
  });

  it("validates Zod input schemas for packs and moves", () => {
    const validPackInput = openPackInputSchema.safeParse({
      packId: "a1000000-0000-4000-8000-000000000001",
    });
    assert.ok(validPackInput.success);

    const invalidPackInput = openPackInputSchema.safeParse({ packId: "not-a-uuid" });
    assert.strictEqual(invalidPackInput.success, false);

    const validMove = duelRoundMoveSchema.safeParse({
      duelId: "a1000000-0000-4000-8000-000000000001",
      roundNumber: 1,
      cardId: "a1000000-0000-4000-8000-000000000002",
      statKey: "attack_power",
    });
    assert.ok(validMove.success);
  });

  it("enforces canonical BDFutbol ID for all player card photographs", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const squads = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "src/data/historical/squads.json"), "utf8")
    );

    const bdfIdsInSquads = new Set<string>();
    for (const seasonData of Object.values<{ players: Array<{ photoUrl?: string | null }> }>(squads)) {
      for (const p of seasonData.players) {
        if (!p.photoUrl) continue;
        const m = p.photoUrl.match(/\/j\/(\d+)/);
        if (m) bdfIdsInSquads.add(m[1]);
      }
    }

    const playerCards = HISTORICAL_CARDS_SEED.filter((c) => c.kind === "player");
    assert.strictEqual(playerCards.length, 485);

    for (const card of playerCards) {
      const match = card.photoUrl.match(/\/images\/cards\/historical\/bdf-(\d+)\.jpg$/);
      assert.ok(
        match,
        `Card ${card.slug} does not use canonical BDFutbol ID image format: ${card.photoUrl}`
      );

      const bdfId = match[1];
      assert.ok(
        bdfIdsInSquads.has(bdfId),
        `Card ${card.knownAs} has unknown BDFutbol ID ${bdfId} not found in historical squads`
      );

      const diskPath = path.join(process.cwd(), "public", card.photoUrl);
      assert.ok(
        fs.existsSync(diskPath),
        `Physical image missing on disk for card ${card.knownAs} (${bdfId}): ${diskPath}`
      );

      const stat = fs.statSync(diskPath);
      assert.ok(
        stat.size > 300,
        `Image on disk is corrupt or empty (<300 bytes) for ${card.knownAs}: ${diskPath}`
      );
    }
  });
});
