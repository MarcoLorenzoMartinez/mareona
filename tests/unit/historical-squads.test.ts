import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSquadForSeason, getAssistsForSeason } from "../../src/lib/historical/service.ts";

describe("Historical Squads and Leaders", () => {
  it("retrieves official squad and top scorer for 1978-79 (Quini 23 goals) with photos", () => {
    const squad = getSquadForSeason("1978-79");
    assert.ok(squad);
    const miera = squad.coaches.find((c) => c.alias === "Miera");
    assert.ok(miera);
    assert.ok(miera.photoUrl && miera.photoUrl.includes("bdfutbol.com"));
    assert.ok(squad.topScorers.length > 0);
    assert.equal(squad.topScorers[0]?.name, "Quini");
    assert.equal(squad.topScorers[0]?.goals, 23);
    assert.ok(squad.topScorers[0]?.photoUrl && squad.topScorers[0]?.photoUrl.includes("bdfutbol.com"));
    assert.ok(squad.players.length >= 20);
    const quini = squad.players.find((p) => p.alias === "Quini");
    assert.ok(quini?.photoUrl && quini.photoUrl.includes("bdfutbol.com"));
  });

  it("retrieves coaches and squad for 2024-25", () => {
    const squad = getSquadForSeason("2024-25");
    assert.ok(squad);
    assert.ok(squad.coaches.some((c) => c.alias === "Albés" || c.fullName.includes("Albés")));
    assert.ok(squad.topScorers.length > 0);
    assert.equal(squad.topScorers[0]?.name, "Otero");
    assert.ok(squad.players.length >= 25);
  });

  it("retrieves verified modern assists for 2023-24 (Cote leader with 8)", () => {
    const assists = getAssistsForSeason("2023-24");
    assert.ok(assists.length > 0);
    assert.equal(assists[0]?.name, "Cote");
    assert.equal(assists[0]?.assists, 8);
  });

  it("returns empty array for historical era assists where not officially recorded", () => {
    const assists = getAssistsForSeason("1978-79");
    assert.deepEqual(assists, []);
  });

  it("returns null safely for non-existent season", () => {
    const squad = getSquadForSeason("1899-00");
    assert.equal(squad, null);
  });

  it("does not represent missing minutes as zero for players with appearances", () => {
    const invalidPlayers = Object.values({
      "2025-26": getSquadForSeason("2025-26"),
      "2024-25": getSquadForSeason("2024-25"),
      "1978-79": getSquadForSeason("1978-79"),
    })
      .filter((squad): squad is NonNullable<typeof squad> => squad !== null)
      .flatMap((squad) => squad.players.filter((player) => player.played > 0 && player.minutes === 0));

    assert.deepEqual(invalidPlayers, []);
  });

  it("assigns chronological gallery photos across different career stages", () => {
    // 1. Cote: Young debut in 2008-09 vs adult captain in 2023-24
    const squad2008 = getSquadForSeason("2008-09");
    const cote2008 = squad2008?.players.find((p) => p.alias === "Cote");
    assert.ok(cote2008?.photoUrl);
    assert.ok(cote2008.photoUrl.endsWith("8510.jpg") || cote2008.photoUrl.endsWith("8510.png"), "Cote in 2008-09 should have debut portrait");

    const squad2023 = getSquadForSeason("2023-24");
    const cote2023 = squad2023?.players.find((p) => p.alias === "Cote");
    assert.ok(cote2023?.photoUrl);
    assert.ok(cote2023.photoUrl.includes("8510"), "Cote in 2023-24 should use the BDFutbol player portrait");

    // 2. Guille Rosas: first team portrait in 2023-24 (22624c.jpg)
    const rosas2023 = squad2023?.players.find((p) => p.alias === "Rosas");
    assert.ok(rosas2023?.photoUrl);
    assert.ok(rosas2023.photoUrl.includes("22624"), "Guille Rosas in 2023-24 should use the BDFutbol player portrait");

    // 3. Jony: Los Guajes 2014-15 (201014d.jpg) vs Return 2017-18 (201014e.jpg) vs Return 2021-22 (201014j.jpg)
    const squad2014 = getSquadForSeason("2014-15");
    const jony2014 = squad2014?.players.find((p) => p.alias === "Jony");
    assert.ok(jony2014?.photoUrl);
    assert.ok(jony2014.photoUrl.includes("201014"), "Jony in 2014-15 should use the BDFutbol player portrait");

    const squad2017 = getSquadForSeason("2017-18");
    const jony2017 = squad2017?.players.find((p) => p.alias === "Jony");
    assert.ok(jony2017?.photoUrl);
    assert.ok(jony2017.photoUrl.includes("201014"), "Jony in 2017-18 should use the BDFutbol player portrait");

    const squad2021 = getSquadForSeason("2021-22");
    const jony2021 = squad2021?.players.find((p) => p.alias === "Jony");
    assert.ok(jony2021?.photoUrl);
    assert.ok(jony2021.photoUrl.includes("201014"), "Jony in 2021-22 should use the BDFutbol player portrait");
  });
});
