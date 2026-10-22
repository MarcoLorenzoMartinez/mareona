import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAiLineup, decideAiAttackMove, decideAiDefenseMove } from "../../src/lib/cards/duel-ai.ts";
import { validateTacticalFormation } from "../../src/lib/cards/combat.ts";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";

describe("Duel Match & AI Engine Suite", () => {
  it("builds a valid AI lineup conforming to formation slot requirements", () => {
    const lineup433 = buildAiLineup("4-3-3");
    assert.strictEqual(lineup433.length, 11);
    const valid433 = validateTacticalFormation("4-3-3", lineup433);
    assert.ok(valid433.isValid, valid433.reason);

    const lineup442 = buildAiLineup("4-4-2");
    assert.strictEqual(lineup442.length, 11);
    const valid442 = validateTacticalFormation("4-4-2", lineup442);
    assert.ok(valid442.isValid, valid442.reason);
  });

  it("decides attacking move picking an available card and a valid stat", () => {
    const lineup = buildAiLineup("4-3-3");
    const move = decideAiAttackMove(lineup);

    assert.ok(move.card);
    assert.ok(lineup.some((c) => c.id === move.card.id));
    assert.ok(
      ["matches_played", "attack_power", "defense_power", "ovr"].includes(move.statKey)
    );
  });

  it("decides defense move under fog of war from available cards", () => {
    const lineup = buildAiLineup("4-3-3");
    const defenseCard = decideAiDefenseMove(lineup, "attack_power");

    assert.ok(defenseCard);
    assert.ok(lineup.some((c) => c.id === defenseCard.id));
  });

  it("simulates full 11-round duel with cards being exhausted", () => {
    const teamA = [...HISTORICAL_CARDS_SEED.slice(0, 11)];
    const teamB = [...HISTORICAL_CARDS_SEED.slice(11, 22)];

    assert.strictEqual(teamA.length, 11);
    assert.strictEqual(teamB.length, 11);

    const usedA = new Set<string>();
    const usedB = new Set<string>();

    for (let round = 1; round <= 11; round++) {
      const availA = teamA.filter((c) => !usedA.has(c.id));
      const availB = teamB.filter((c) => !usedB.has(c.id));

      assert.strictEqual(availA.length, 12 - round);
      assert.strictEqual(availB.length, 12 - round);

      const moveA = decideAiAttackMove(availA);
      const moveB = decideAiDefenseMove(availB, moveA.statKey);

      usedA.add(moveA.card.id);
      usedB.add(moveB.id);
    }

    assert.strictEqual(usedA.size, 11);
    assert.strictEqual(usedB.size, 11);
  });
});
