import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getIndividualAwards,
  getTopCoaches,
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

  it("calculates top coaches ranking by matches directed (Novoa #1, Preciado #2)", () => {
    const coaches = getTopCoaches(10);
    assert.equal(coaches.length, 10);
    assert.equal(coaches[0]?.fullName, "José Manuel Díaz");
    assert.equal(coaches[0]?.matches, 230);
    assert.equal(coaches[0]?.won, 82);
    assert.equal(coaches[0]?.rank, 1);
    assert.deepEqual(coaches[0]?.eras, [
      "1979/80",
      "1981/82",
      "1984/85 – 1987/88",
      "1995/96",
      "1997/98",
    ]);

    assert.equal(coaches[1]?.fullName, "Manuel Preciado");
    assert.equal(coaches[1]?.matches, 218);
    assert.equal(coaches[1]?.rank, 2);
    assert.deepEqual(coaches[1]?.eras, ["2006/07 – 2011/12"]);

    assert.equal(coaches[2]?.fullName, "Amadeo Sánchez");
    assert.equal(coaches[2]?.matches, 173);
    assert.equal(coaches[2]?.rank, 3);
  });

  it("breaks ties in coach rankings by wins, and then by draws", () => {
    const coaches = getTopCoaches(20);

    // Tie in matches (116 PJ): Molinuevo (59 V) vs Ciriaco (45 V) -> Molinuevo wins tie
    const molinuevoIdx = coaches.findIndex((c) => c.fullName === "José Luis Molinuevo");
    const ciriacoIdx = coaches.findIndex((c) => c.fullName === "Ciriaco Cano");
    assert.ok(molinuevoIdx !== -1 && ciriacoIdx !== -1);
    assert.equal(coaches[molinuevoIdx]?.matches, 116);
    assert.equal(coaches[ciriacoIdx]?.matches, 116);
    assert.ok(molinuevoIdx < ciriacoIdx, "Molinuevo (59V) should rank ahead of Ciriaco (45V)");

    // Tie in matches (70 PJ) and wins (26 V): Sandoval (23 E) vs Gallego (22 E) -> Sandoval wins tie by draws
    const sandovalIdx = coaches.findIndex((c) => c.fullName === "José Ramón Sandoval");
    const gallegoIdx = coaches.findIndex((c) => c.fullName === "David Gallego");
    assert.ok(sandovalIdx !== -1 && gallegoIdx !== -1);
    assert.equal(coaches[sandovalIdx]?.matches, 70);
    assert.equal(coaches[gallegoIdx]?.matches, 70);
    assert.equal(coaches[sandovalIdx]?.won, 26);
    assert.equal(coaches[gallegoIdx]?.won, 26);
    assert.ok(sandovalIdx < gallegoIdx, "Sandoval (23E) should rank ahead of Gallego (22E)");
  });
});





