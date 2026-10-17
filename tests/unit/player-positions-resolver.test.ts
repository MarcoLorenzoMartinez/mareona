import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  inferTacticalPositions,
  resolveRivalPositions,
} from "../../src/lib/historical/player-positions-resolver.ts";
import type { HistoricalMatchPlayer } from "../../src/lib/historical/types";

describe("Player Positions Resolver", () => {
  it("infers positions for modern era line-up according to positional order", () => {
    const starters: HistoricalMatchPlayer[] = [
      { name: "Player 1" },
      { name: "Player 2" },
      { name: "Player 3" },
      { name: "Player 4" },
      { name: "Player 5" },
      { name: "Player 6" },
      { name: "Player 7" },
      { name: "Player 8" },
      { name: "Player 9" },
      { name: "Player 10" },
      { name: "Player 11" },
    ];

    inferTacticalPositions(starters, 1995);

    assert.equal(starters[0].position, "Portero");
    assert.equal(starters[1].position, "Defensa");
    assert.equal(starters[2].position, "Defensa");
    assert.equal(starters[3].position, "Defensa");
    assert.equal(starters[4].position, "Defensa");
    assert.equal(starters[5].position, "Centrocampista");
    assert.equal(starters[6].position, "Centrocampista");
    assert.equal(starters[7].position, "Centrocampista");
    assert.equal(starters[8].position, "Centrocampista");
    assert.equal(starters[9].position, "Delantero");
    assert.equal(starters[10].position, "Delantero");
  });

  it("infers positions for classic WM era line-up (<= 1965)", () => {
    const starters: HistoricalMatchPlayer[] = [
      { name: "GK" },
      { name: "D1" },
      { name: "D2" },
      { name: "D3" },
      { name: "M1" },
      { name: "M2" },
      { name: "M3" },
      { name: "F1" },
      { name: "F2" },
      { name: "F3" },
      { name: "F4" },
    ];

    inferTacticalPositions(starters, 1954);

    assert.equal(starters[0].position, "Portero");
    assert.equal(starters[1].position, "Defensa");
    assert.equal(starters[2].position, "Defensa");
    assert.equal(starters[3].position, "Defensa");
    assert.equal(starters[4].position, "Centrocampista");
    assert.equal(starters[5].position, "Centrocampista");
    assert.equal(starters[6].position, "Centrocampista");
    assert.equal(starters[7].position, "Delantero");
    assert.equal(starters[8].position, "Delantero");
    assert.equal(starters[9].position, "Delantero");
    assert.equal(starters[10].position, "Delantero");
  });

  it("resolves cached rival players instantly without overwriting known positions", async () => {
    const starters: HistoricalMatchPlayer[] = [
      { name: "Sorarrain", photoUrl: "https://www.bdfutbol.com/i/m/9786.png" },
      { name: "Basteiro", photoUrl: "https://www.bdfutbol.com/i/m/14367.png" },
      { name: "Custom Midfielder", position: "Centrocampista" },
    ];

    await resolveRivalPositions(starters, true, 1954);

    assert.equal(starters[0].position, "Portero");
    assert.equal(starters[1].position, "Defensa");
    assert.equal(starters[2].position, "Centrocampista");
  });
});
