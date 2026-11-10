import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  encodeSharedLineup,
  decodeSharedLineup,
  parsePostLineup,
  buildSharedLineupFromSlots,
  type SharedLineupData,
} from "../../src/lib/lineup-builder/shared-lineup-codec.ts";
import type { PitchAssignedPlayer } from "../../src/lib/lineup-builder/types.ts";

describe("Shared Lineup Codec & Custom Coordinate Preservation", () => {
  const sampleLineup: SharedLineupData = {
    formationKey: "4-2-3-1",
    teamTitle: "Real Sporting",
    starters: [
      { role: "POR", displayName: "Yáñez", shirtNumber: 1, photoUrl: "https://images.fotmob.com/image_resources/playerimages/1145322.png", coord: { x: 50.0, y: 88.0 } },
      { role: "LI", displayName: "Cote", shirtNumber: 3, photoUrl: null, coord: { x: 18.5, y: 65.2 } },
      { role: "DFC", displayName: "Rober Pier", shirtNumber: 4, photoUrl: null, coord: { x: 38.0, y: 71.0 } },
      { role: "DFC", displayName: "Diego Sánchez", shirtNumber: 24, photoUrl: null, coord: { x: 62.0, y: 71.0 } },
      { role: "LD", displayName: "Guille Rosas", shirtNumber: 2, photoUrl: null, coord: { x: 84.0, y: 69.0 } },
      { role: "MCD", displayName: "Nacho Martín", shirtNumber: 6, photoUrl: null, coord: { x: 36.0, y: 53.0 } },
      { role: "MCD", displayName: "Lander", shirtNumber: 14, photoUrl: null, coord: { x: 64.0, y: 53.0 } },
      { role: "EI", displayName: "Queipo", shirtNumber: 9, photoUrl: null, coord: { x: 15.0, y: 32.5 } }, // Hand moved!
      { role: "MCO", displayName: "Gelabert", shirtNumber: 25, photoUrl: null, coord: { x: 52.3, y: 34.1 } }, // Hand moved!
      { role: "ED", displayName: "Dubasin", shirtNumber: 19, photoUrl: "https://images.fotmob.com/image_resources/playerimages/1748414.png", coord: { x: 86.4, y: 30.0 } }, // Hand moved!
      { role: "DC", displayName: "Otero", shirtNumber: 18, photoUrl: null, coord: { x: 50.0, y: 14.0 } }, // Hand moved!
    ],
  };

  it("encodes and decodes lineup while preserving exact hand-moved coordinates", () => {
    const encoded = encodeSharedLineup(sampleLineup);
    assert.ok(encoded.startsWith("<!--once:4-2-3-1|"));
    assert.ok(encoded.endsWith("-->"));

    const decoded = decodeSharedLineup(encoded);
    assert.ok(decoded);
    assert.equal(decoded.formationKey, "4-2-3-1");
    assert.equal(decoded.starters.length, 11);

    // Check specific hand-moved coordinates
    assert.equal(decoded.starters[7]?.displayName, "Queipo");
    assert.equal(decoded.starters[7]?.coord.x, 15.0);
    assert.equal(decoded.starters[7]?.coord.y, 32.5);

    assert.equal(decoded.starters[8]?.displayName, "Gelabert");
    assert.equal(decoded.starters[8]?.coord.x, 52.3);
    assert.equal(decoded.starters[8]?.coord.y, 34.1);

    assert.equal(decoded.starters[9]?.displayName, "Dubasin");
    assert.equal(decoded.starters[9]?.coord.x, 86.4);
    assert.equal(decoded.starters[9]?.coord.y, 30.0);

    // Check FotMob photo reconstitution
    assert.equal(
      decoded.starters[0]?.photoUrl,
      "https://images.fotmob.com/image_resources/playerimages/1145322.png"
    );
    assert.equal(
      decoded.starters[9]?.photoUrl,
      "https://images.fotmob.com/image_resources/playerimages/1748414.png"
    );
  });

  it("parses post text and separates clean user text from lineup payload", () => {
    const encoded = encodeSharedLineup(sampleLineup);
    const postBody = `¡Este es mi once para ganar el derbi!\n\n${encoded}`;

    const { cleanBody, lineup } = parsePostLineup(postBody);
    assert.equal(cleanBody, "¡Este es mi once para ganar el derbi!");
    assert.ok(lineup);
    assert.equal(lineup.formationKey, "4-2-3-1");
    assert.equal(lineup.starters.length, 11);
  });

  it("returns null lineup when post has no lineup tag", () => {
    const postBody = "Solo un mensaje normal sin alineación.";
    const { cleanBody, lineup } = parsePostLineup(postBody);
    assert.equal(cleanBody, postBody);
    assert.equal(lineup, null);
  });

  it("builds SharedLineupData from AssignedSlots directly", () => {
    const slots: PitchAssignedPlayer[] = [
      {
        slotId: "s-por",
        role: "POR",
        coord: { x: 50.1, y: 88.2 },
        player: {
          id: "p1",
          displayName: "Yáñez",
          fullName: "Rubén Yáñez",
          shirtNumber: 1,
          defaultPosition: "POR",
          category: "first_team",
          photoUrl: null,
        },
      },
      ...Array.from({ length: 10 }, (_, i) => ({
        slotId: `s-${i}`,
        role: "MC" as const,
        coord: { x: 30 + i * 5, y: 50 },
        player: null,
      })),
    ];

    const result = buildSharedLineupFromSlots("4-3-3", slots);
    assert.equal(result.formationKey, "4-3-3");
    assert.equal(result.starters.length, 11);
    assert.equal(result.starters[0]?.displayName, "Yáñez");
    assert.equal(result.starters[0]?.coord.x, 50.1);
    assert.equal(result.starters[0]?.coord.y, 88.2);
  });
});
