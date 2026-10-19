import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getTopCoaches,
} from "../../src/lib/historical/legacy-service.ts";

describe("Historical Legacy Service", () => {
  it("calculates all-time appearances ranking correctly (Joaquín #1, Jiménez #2, Quini #3)", () => {
    const ranking = getTopAppearancesPlayers(10);
    assert.equal(ranking.length, 10);
    assert.equal(ranking[0]?.name, "Joaquín");
    assert.equal(ranking[0]?.totalPlayed, 646);
    assert.equal(ranking[0]?.rank, 1);

    assert.equal(ranking[1]?.name, "Jiménez");
    assert.equal(ranking[1]?.totalPlayed, 534);
    assert.equal(ranking[1]?.rank, 2);

    assert.equal(ranking[2]?.name, "Quini");
    assert.equal(ranking[2]?.totalPlayed, 521);
    assert.equal(ranking[2]?.rank, 3);

    // Verify top legends presence
    const names = ranking.map((p) => p.name);
    assert.ok(names.includes("Castro"));
    assert.ok(names.includes("Ablanedo II"));
    assert.ok(names.includes("Mesa"));
    assert.ok(names.includes("Cundi"));
  });

  it("calculates all-time scorers ranking correctly (Quini at #1 with 272 goals)", () => {
    const scorers = getTopScorersPlayers(10);
    assert.equal(scorers.length, 10);
    assert.equal(scorers[0]?.name, "Quini");
    assert.equal(scorers[0]?.totalGoals, 272);
    assert.equal(scorers[0]?.rank, 1);

    assert.equal(scorers[1]?.name, "Ortiz");
    assert.equal(scorers[1]?.totalGoals, 131);

    // Verify legendary scorers
    const names = scorers.map((p) => p.name);
    assert.ok(names.includes("Pin"));
    assert.ok(names.includes("Pío"));
    assert.ok(names.includes("Pocholo"));
  });

  it("calculates players with most seasons correctly (Castro leading with 18)", () => {
    const seasons = getTopSeasonsPlayers(10);
    assert.ok(seasons.length > 0);
    assert.equal(seasons[0]?.name, "Castro");
    assert.equal(seasons[0]?.seasonCount, 18);

    assert.equal(seasons[1]?.name, "Ablanedo II");
    assert.equal(seasons[1]?.seasonCount, 17);

    assert.equal(seasons[2]?.name, "Cundi");
    assert.equal(seasons[2]?.seasonCount, 17);
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

  it("formats canonical player start and end seasons accurately without year shifts", () => {
    const players = getTopAppearancesPlayers(10);
    const joaquin = players.find((p) => p.name === "Joaquín");
    assert.equal(joaquin?.startSeason, "1976/77");
    assert.equal(joaquin?.endSeason, "1991/92");

    const jimenez = players.find((p) => p.name === "Jiménez");
    assert.equal(jimenez?.startSeason, "1979/80");
    assert.equal(jimenez?.endSeason, "1990/91");

    const quini = players.find((p) => p.name === "Quini");
    assert.equal(quini?.startSeason, "1968/69");
    assert.equal(quini?.endSeason, "1986/87");

    const castro = players.find((p) => p.name === "Castro");
    assert.equal(castro?.startSeason, "1967/68");
    assert.equal(castro?.endSeason, "1984/85");

    const ablanedo = players.find((p) => p.name === "Ablanedo II");
    assert.equal(ablanedo?.startSeason, "1982/83");
    assert.equal(ablanedo?.endSeason, "1998/99");
  });
});
