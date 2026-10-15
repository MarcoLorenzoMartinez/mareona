import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveSportingPlayerId,
  CANONICAL_FOTMOB_SPORTING_PLAYERS,
} from "../../src/lib/sports-api/fotmob-player-resolver.ts";

test("CANONICAL_FOTMOB_SPORTING_PLAYERS maps canteranos correctly", () => {
  assert.equal(CANONICAL_FOTMOB_SPORTING_PLAYERS["mata"], 1971125);
  assert.equal(CANONICAL_FOTMOB_SPORTING_PLAYERS["diego matabuena"], 1971125);
  assert.equal(CANONICAL_FOTMOB_SPORTING_PLAYERS["enol prendes"], 1748414);
  assert.equal(CANONICAL_FOTMOB_SPORTING_PLAYERS["christian ferreres"], 2144593);
  assert.equal(CANONICAL_FOTMOB_SPORTING_PLAYERS["miguel conde"], 1833800);
  assert.equal(CANONICAL_FOTMOB_SPORTING_PLAYERS["bruno rubio"], 2144594);
});

test("resolveSportingPlayerId resolves Mata and Enol Prendes instantly via canonical tier", async () => {
  const mataId = await resolveSportingPlayerId(34, "Mata", "Diego Matabuena");
  assert.equal(mataId, 1971125);

  const enolId = await resolveSportingPlayerId(27, "Enol Prendes", "Enol Prendes");
  assert.equal(enolId, 1748414);

  const ferreresId = await resolveSportingPlayerId(35, "Ferreres", "Christian Ferreres");
  assert.equal(ferreresId, 2144593);
});

test("resolveSportingPlayerId handles unmapped player with invalid data gracefully", async () => {
  const unmappedId = await resolveSportingPlayerId(null, "Jugador Inexistente XYZ 12345");
  assert.equal(unmappedId, null);
});
