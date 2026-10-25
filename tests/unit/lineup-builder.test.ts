import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TACTICAL_FORMATIONS, clampPitchCoordinate } from "../../src/lib/lineup-builder/formations.ts";
import { customPlayerSchema } from "../../src/lib/lineup-builder/types.ts";
import { ACADEMY_SPORTING_PLAYERS } from "../../src/lib/lineup-builder/academy-players.ts";
import { buildUnifiedRoster, mapDomainPlayerToLineupPlayer } from "../../src/lib/lineup-builder/roster-builder.ts";
import type { DomainPlayer } from "../../src/lib/sports-api/types.ts";

describe("Lineup Builder Domain Suite", () => {
  it("defines standard tactical formations with exactly 11 slots each", () => {
    const formationKeys = Object.keys(TACTICAL_FORMATIONS) as (keyof typeof TACTICAL_FORMATIONS)[];
    assert.ok(formationKeys.length >= 5);

    for (const key of formationKeys) {
      const formation = TACTICAL_FORMATIONS[key];
      assert.equal(formation.slots.length, 11, `Formation ${key} should have 11 slots`);
      // Goalkeeper is always the first slot
      assert.equal(formation.slots[0].defaultRole, "POR");
      assert.ok(formation.slots[0].defaultCoord.y >= 80, "Goalkeeper should be near own goal");
    }
  });

  it("clamps pitch coordinates safely within field boundary margins", () => {
    const clampedCenter = clampPitchCoordinate({ x: 50, y: 50 });
    assert.deepEqual(clampedCenter, { x: 50, y: 50 });

    const clampedOutMin = clampPitchCoordinate({ x: -10, y: -20 });
    assert.deepEqual(clampedOutMin, { x: 10, y: 10 });

    const clampedOutMax = clampPitchCoordinate({ x: 150, y: 120 });
    assert.deepEqual(clampedOutMax, { x: 90, y: 90 });
  });

  it("validates custom player input with Zod schema", () => {
    const valid = customPlayerSchema.safeParse({
      displayName: "Pelayín",
      shirtNumber: 42,
      defaultPosition: "DEL",
      category: "custom",
    });
    assert.ok(valid.success);

    const invalidName = customPlayerSchema.safeParse({
      displayName: "A",
      shirtNumber: 10,
      defaultPosition: "MED",
      category: "custom",
    });
    assert.ok(!invalidName.success);
  });

  it("includes filial and juvenil players in academy roster", () => {
    assert.ok(ACADEMY_SPORTING_PLAYERS.length > 5);
    const hasFilial = ACADEMY_SPORTING_PLAYERS.some((p) => p.category === "filial");
    const hasJuvenil = ACADEMY_SPORTING_PLAYERS.some((p) => p.category === "juvenil");
    assert.ok(hasFilial);
    assert.ok(hasJuvenil);
  });

  it("combines first-team and academy players in unified roster", () => {
    const mockDomainPlayer: DomainPlayer = {
      id: "731-yanez",
      externalId: "yanez-1",
      fullName: "Rubén Yáñez",
      displayName: "Yáñez",
      shortName: "Yáñez",
      shirtNumber: 1,
      position: "goalkeeper",
      positionLabel: "Portero",
      positionShort: "POR",
      age: 30,
      birthDate: "1993-10-12",
      nationality: "España",
      flagUrl: null,
      photoUrl: "https://example.com/yanez.png",
      height: "188",
      weight: "80",
      stats: { appearances: 10, goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
    };

    const lineupPlayer = mapDomainPlayerToLineupPlayer(mockDomainPlayer);
    assert.equal(lineupPlayer.category, "first_team");
    assert.equal(lineupPlayer.defaultPosition, "POR");
    assert.equal(lineupPlayer.shirtNumber, 1);

    const unified = buildUnifiedRoster([mockDomainPlayer]);
    assert.equal(unified.length, 1 + ACADEMY_SPORTING_PLAYERS.length);
  });

  it("deduplicates academy players when already present in first team squad", () => {
    const mockEnolFirstTeam: DomainPlayer = {
      id: "731-enol",
      externalId: "enol-1",
      fullName: "Enol Prendes Rodríguez",
      displayName: "Enol Prendes",
      shortName: "Enol",
      shirtNumber: 27,
      position: "forward",
      positionLabel: "Delantero",
      positionShort: "DEL",
      age: 20,
      birthDate: "2004-05-10",
      nationality: "España",
      flagUrl: null,
      photoUrl: null,
      height: "182",
      weight: "75",
      stats: { appearances: 3, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    };

    const unified = buildUnifiedRoster([mockEnolFirstTeam]);
    const enolOccurrences = unified.filter((p) => p.displayName === "Enol Prendes");
    assert.equal(enolOccurrences.length, 1);
    assert.equal(enolOccurrences[0].category, "first_team");
  });
});
