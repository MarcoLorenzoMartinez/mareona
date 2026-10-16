import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getMatchesForSeason, getMatchesSummary } from "../../src/lib/historical/matches-data.ts";

describe("Historical Matches Data Service", () => {
  it("returns verified official matches for modern season 2023-24", () => {
    const matches = getMatchesForSeason("2023-24");
    assert.ok(matches.length >= 42, "2023-24 season has at least 42 matches");

    // Match 1 was against Real Valladolid (away)
    const match1 = matches[0];
    assert.ok(match1);
    assert.equal(match1.date, "11/08/2023");
    assert.equal(match1.competition, "Liga");
    assert.equal(match1.isHome, false);
    assert.equal(match1.awayTeam, "Real Sporting");
    assert.equal(match1.homeTeam, "Real Valladolid");
    assert.equal(match1.outcome, "D");

    // Match 2 was against Mirandés (home, won 3-0)
    const match2 = matches[1];
    assert.ok(match2);
    assert.equal(match2.date, "20/08/2023");
    assert.equal(match2.homeTeam, "Real Sporting");
    assert.equal(match2.isHome, true);
    assert.equal(match2.homeScore, 3);
    assert.equal(match2.awayScore, 0);
    assert.equal(match2.outcome, "V");
  });

  it("returns official European and League matches for 1978-79 runner-up campaign", () => {
    const matches = getMatchesForSeason("1978-79");
    assert.ok(matches.length >= 34, "1978-79 has at least 34 league matches");

    // Check presence of European Cup (Copa UEFA)
    const uefaMatches = matches.filter((m) => m.competition === "Copa UEFA");
    assert.ok(uefaMatches.length > 0, "Contains UEFA Cup matches");
    assert.ok(uefaMatches.some((m) => m.homeTeam.includes("Torino") || m.awayTeam.includes("Torino")));
  });

  it("returns inaugural league and cup matches for 1928-29", () => {
    const matches = getMatchesForSeason("1928-29");
    assert.ok(matches.length > 0, "Inaugural 1928-29 has official recorded matches");

    const match1 = matches[0];
    assert.ok(match1);
    assert.equal(match1.homeTeam, "Real Sporting");
  });

  it("returns empty array for non-existent season", () => {
    const matches = getMatchesForSeason("1899-00");
    assert.deepEqual(matches, []);
  });

  it("computes matches summary accurately", () => {
    const sampleMatches = [
      {
        id: "1",
        date: "01/01/2024",
        competition: "Liga",
        round: "Jor. 1",
        homeTeam: "Real Sporting",
        awayTeam: "Real Oviedo",
        homeScore: 2,
        awayScore: 1,
        isHome: true,
        outcome: "V" as const,
        opponent: "Real Oviedo",
      },
      {
        id: "2",
        date: "08/01/2024",
        competition: "Liga",
        round: "Jor. 2",
        homeTeam: "Racing de Santander",
        awayTeam: "Real Sporting",
        homeScore: 1,
        awayScore: 1,
        isHome: false,
        outcome: "E" as const,
        opponent: "Racing de Santander",
      },
      {
        id: "3",
        date: "15/01/2024",
        competition: "Liga",
        round: "Jor. 3",
        homeTeam: "Real Sporting",
        awayTeam: "Levante UD",
        homeScore: 0,
        awayScore: 2,
        isHome: true,
        outcome: "D" as const,
        opponent: "Levante UD",
      },
    ];

    const summary = getMatchesSummary(sampleMatches);
    assert.equal(summary.total, 3);
    assert.equal(summary.wins, 1);
    assert.equal(summary.draws, 1);
    assert.equal(summary.losses, 1);
    assert.equal(summary.goalsFor, 3); // 2 + 1 + 0
    assert.equal(summary.goalsAgainst, 4); // 1 + 1 + 2
    assert.equal(summary.goalDiff, -1);
  });
});
