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

  it("keeps Copa de la Liga ties separate from league matches", () => {
    for (const seasonId of ["1982-83", "1983-84", "1984-85", "1985-86"]) {
      const matches = getMatchesForSeason(seasonId);
      const leagueMatches = matches.filter((match) => match.competition === "Liga");
      const leagueRounds = leagueMatches.map((match) => match.round);

      assert.equal(
        leagueMatches.length,
        leagueMatches.filter((match) => match.round.startsWith("Jornada")).length,
        `${seasonId} should not label knockout rounds as Liga`,
      );
      assert.ok(
        matches.some((match) => match.competition === "Copa de la Liga"),
        `${seasonId} should expose Copa de la Liga matches`,
      );
      assert.ok(
        leagueRounds.every((round) => round.startsWith("Jornada")),
        `${seasonId} league rounds should be regular matchdays`,
      );
    }
  });

  it("returns inaugural league and cup matches for 1928-29", () => {
    const matches = getMatchesForSeason("1928-29");
    assert.ok(matches.length > 0, "Inaugural 1928-29 has official recorded matches");

    const match1 = matches[0];
    assert.ok(match1);
    assert.equal(match1.homeTeam, "Real Oviedo");
    assert.equal(match1.awayTeam, "Real Sporting");
    assert.equal(match1.date, "07/10/1928");
  });

  it("keeps pre-war match records in chronological order", () => {
    for (const seasonId of ["1928-29", "1929-30", "1930-31", "1931-32", "1932-33", "1933-34", "1934-35", "1935-36"]) {
      const matches = getMatchesForSeason(seasonId);
      for (let index = 1; index < matches.length; index += 1) {
        const previous = matches[index - 1];
        const current = matches[index];
        assert.ok(previous);
        assert.ok(current);
        assert.ok(
          parseHistoricalDate(previous.date) <= parseHistoricalDate(current.date),
          `${seasonId} is not chronological at index ${index}`,
        );
      }
    }
  });

  it("records the 1991 UEFA tie against Steaua as a 2-2 draw", () => {
    const match = getMatchesForSeason("1991-92").find(
      (item) => item.date === "24/10/1991" && item.opponent === "Steaua București",
    );
    assert.ok(match);
    assert.equal(match.homeScore, 2);
    assert.equal(match.awayScore, 2);
    assert.equal(match.outcome, "E");
  });

  it("returns empty array for non-existent season", () => {
    const matches = getMatchesForSeason("1899-00");
    assert.deepEqual(matches, []);
  });

  function parseHistoricalDate(value: string): number {
    const [day, month, year] = value.split("/").map(Number);
    return Date.UTC(year, month - 1, day);
  }

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
