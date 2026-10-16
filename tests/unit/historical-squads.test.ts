import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSquadForSeason, getAssistsForSeason } from "../../src/lib/historical/service.ts";

describe("Historical Squads and Leaders", () => {
  it("retrieves official squad and top scorer for 1978-79 (Quini 23 goals)", () => {
    const squad = getSquadForSeason("1978-79");
    assert.ok(squad);
    assert.ok(squad.coaches.some((c) => c.alias === "Miera"));
    assert.ok(squad.topScorers.length > 0);
    assert.equal(squad.topScorers[0]?.name, "Quini");
    assert.equal(squad.topScorers[0]?.goals, 23);
    assert.ok(squad.players.length >= 20);
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
});
