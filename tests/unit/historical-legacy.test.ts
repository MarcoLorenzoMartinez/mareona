import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getIndividualAwards,
  getLegendProfiles,
} from "../../src/lib/historical/legacy-service.ts";

describe("Historical Legacy Service", () => {
  it("calculates all-time appearances ranking correctly (Ablanedo II at #1)", () => {
    const ranking = getTopAppearancesPlayers(10);
    assert.equal(ranking.length, 10);
    assert.equal(ranking[0]?.name, "Ablanedo II");
    assert.equal(ranking[0]?.totalPlayed, 459);
    assert.equal(ranking[0]?.rank, 1);

    // Verify top 5 legends presence
    const names = ranking.map((p) => p.name);
    assert.ok(names.includes("Cundi"));
    assert.ok(names.includes("Castro"));
    assert.ok(names.includes("Joaquín"));
    assert.ok(names.includes("Quini"));
  });

  it("calculates all-time scorers ranking correctly (Quini at #1)", () => {
    const scorers = getTopScorersPlayers(10);
    assert.equal(scorers.length, 10);
    assert.equal(scorers[0]?.name, "Quini");
    assert.equal(scorers[0]?.totalGoals, 230);
    assert.equal(scorers[0]?.rank, 1);

    // Verify legendary scorers
    const names = scorers.map((p) => p.name);
    assert.ok(names.includes("Ortiz"));
    assert.ok(names.includes("Pío"));
    assert.ok(names.includes("Prendes"));
  });

  it("calculates players with most seasons correctly (Castro & Ablanedo II leading)", () => {
    const seasons = getTopSeasonsPlayers(10);
    assert.ok(seasons.length > 0);
    assert.ok(seasons[0]?.seasonCount >= 17);
  });

  it("retrieves verified individual awards (5 Pichichis and 3 Zamoras)", () => {
    const awards = getIndividualAwards();
    assert.equal(awards.length, 8);

    const pichichis = awards.filter((a) => a.awardName === "Trofeo Pichichi");
    assert.equal(pichichis.length, 5);

    const zamoras = awards.filter((a) => a.awardName === "Trofeo Zamora");
    assert.equal(zamoras.length, 3);
  });

  it("retrieves legend profiles with verified highlights", () => {
    const legends = getLegendProfiles();
    assert.ok(legends.length >= 8);

    const quini = legends.find((l) => l.id === "quini");
    assert.ok(quini);
    assert.equal(quini.role, "player");
    assert.ok(quini.highlights.length >= 3);
  });
});

