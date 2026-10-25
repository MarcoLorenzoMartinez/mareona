import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getConcisePlayerName } from "../../src/lib/lineup-builder/player-name-formatter.ts";

describe("Player Name Formatter Suite", () => {
  it("formats well-known Sporting players to their football names", () => {
    assert.equal(getConcisePlayerName("Guillermo Rosas"), "Rosas");
    assert.equal(getConcisePlayerName("Rubén Yáñez"), "Yáñez");
    assert.equal(getConcisePlayerName("Gaspar Campos"), "Gaspar");
    assert.equal(getConcisePlayerName("Konrad De La Fuente"), "Konrad");
    assert.equal(getConcisePlayerName("César Gelabert"), "Gelabert");
    assert.equal(getConcisePlayerName("Alejo Sarco"), "Sarco");
    assert.equal(getConcisePlayerName("Emanuel Gularte"), "Gularte");
    assert.equal(getConcisePlayerName("Nacho Martín"), "Nacho M.");
    assert.equal(getConcisePlayerName("Diego Sanchez"), "Diego S.");
    assert.equal(getConcisePlayerName("Enol Prendes"), "Enol");
    assert.equal(getConcisePlayerName("Mata"), "Mata");
  });

  it("handles unknown or custom player names gracefully", () => {
    assert.equal(getConcisePlayerName("Pelayo"), "Pelayo");
    assert.equal(getConcisePlayerName("Sergio Ramos"), "Ramos");
    assert.equal(getConcisePlayerName(""), "");
  });
});
