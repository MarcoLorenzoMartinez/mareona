import test from "node:test";
import assert from "node:assert/strict";
import {
  apiFootballStandingsResponseSchema,
  apiFootballFixturesResponseSchema,
  transformStandingRow,
  transformFixture,
} from "../../src/lib/sports-api/types.ts";
import { isCacheValid } from "../../src/lib/sports-api/cache.ts";

test("Standings schema successfully parses API-Football payload", () => {
  const samplePayload = {
    get: "standings",
    parameters: { league: "141", season: "2024" },
    errors: [],
    results: 1,
    paging: { current: 1, total: 1 },
    response: [
      {
        league: {
          id: 141,
          name: "Segunda División",
          country: "Spain",
          logo: "https://media.api-sports.io/football/leagues/141.png",
          flag: "https://media.api-sports.io/flags/es.svg",
          season: 2024,
          standings: [
            [
              {
                rank: 3,
                team: {
                  id: 731,
                  name: "Sporting Gijón",
                  logo: "https://media.api-sports.io/football/teams/731.png",
                },
                points: 18,
                goalsDiff: 5,
                group: "Segunda División",
                form: "WWDWL",
                status: "same",
                description: "Promotion Play-off",
                all: {
                  played: 10,
                  win: 5,
                  draw: 3,
                  lose: 2,
                  goals: { for: 14, against: 9 },
                },
                home: {
                  played: 5,
                  win: 3,
                  draw: 1,
                  lose: 1,
                  goals: { for: 8, against: 4 },
                },
                away: {
                  played: 5,
                  win: 2,
                  draw: 2,
                  lose: 1,
                  goals: { for: 6, against: 5 },
                },
                update: "2024-10-13T12:00:00+00:00",
              },
            ],
          ],
        },
      },
    ],
  };

  const parsed = apiFootballStandingsResponseSchema.safeParse(samplePayload);
  assert.equal(parsed.success, true);

  if (parsed.success) {
    const row = parsed.data.response[0]?.league.standings[0]?.[0];
    assert.ok(row);
    const domainRow = transformStandingRow(row);
    assert.equal(domainRow.position, 3);
    assert.equal(domainRow.teamName, "Real Sporting");
    assert.equal(domainRow.points, 18);
    assert.equal(domainRow.isSporting, true);
    assert.equal(domainRow.played, 10);
    assert.equal(domainRow.won, 5);
  }
});

test("Fixtures schema successfully parses API-Football next fixture payload", () => {
  const samplePayload = {
    get: "fixtures",
    parameters: { team: "547", next: "1" },
    errors: [],
    results: 1,
    paging: { current: 1, total: 1 },
    response: [
      {
        fixture: {
          id: 1208453,
          referee: "Guzmán Mansilla",
          timezone: "UTC",
          date: "2024-10-19T16:30:00+00:00",
          timestamp: 1729355400,
          periods: { first: null, second: null },
          venue: {
            id: 1492,
            name: "Estadio El Molinón-Enrique Castro Quini",
            city: "Gijón",
          },
          status: {
            long: "Not Started",
            short: "NS",
            elapsed: null,
          },
        },
        league: {
          id: 141,
          name: "Segunda División",
          country: "Spain",
          logo: "https://media.api-sports.io/football/leagues/141.png",
          flag: "https://media.api-sports.io/flags/es.svg",
          season: 2024,
          round: "Regular Season - 10",
        },
        teams: {
          home: {
            id: 731,
            name: "Sporting Gijón",
            logo: "https://media.api-sports.io/football/teams/731.png",
            winner: null,
          },
          away: {
            id: 546,
            name: "Real Zaragoza",
            logo: "https://media.api-sports.io/football/teams/546.png",
            winner: null,
          },
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ],
  };

  const parsed = apiFootballFixturesResponseSchema.safeParse(samplePayload);
  assert.equal(parsed.success, true);

  if (parsed.success) {
    const rawFixture = parsed.data.response[0];
    assert.ok(rawFixture);
    const domainMatch = transformFixture(rawFixture);
    assert.equal(domainMatch.externalId, "1208453");
    assert.equal(domainMatch.homeTeam.name, "Real Sporting");
    assert.equal(domainMatch.awayTeam.name, "Real Zaragoza");
    assert.equal(domainMatch.venue, "Estadio El Molinón-Enrique Castro Quini");
    assert.equal(domainMatch.status, "scheduled");
    assert.equal(domainMatch.matchday, 10);
  }
});

test("Cache validation correctly evaluates TTL", () => {
  const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  assert.equal(isCacheValid(futureDate), true);
  assert.equal(isCacheValid(pastDate), false);
});

test("normalizeTeamName canonicalizes club name to 'Real Sporting' and filial teams", async () => {
  const { normalizeTeamName, CANONICAL_SPORTING_NAME } = await import(
    "../../src/lib/sports-api/types.ts"
  );
  assert.equal(CANONICAL_SPORTING_NAME, "Real Sporting");
  assert.equal(normalizeTeamName("Sporting Gijón", true), "Real Sporting");
  assert.equal(normalizeTeamName("Sporting de Gijón", true), "Real Sporting");
  assert.equal(normalizeTeamName("Real Sporting", true), "Real Sporting");
  assert.equal(normalizeTeamName("Real Zaragoza", false), "Real Zaragoza");

  // Filial / reserve team canonicalization
  assert.equal(normalizeTeamName("Real Sociedad II", false), "Real Sociedad B");
  assert.equal(normalizeTeamName("Villarreal CF II", false), "Villarreal CF B");
  assert.equal(normalizeTeamName("Levante UD II", false), "Levante UD B");
  assert.equal(normalizeTeamName("Real Madrid II", false), "Real Madrid Castilla");
  assert.equal(normalizeTeamName("Sevilla II", false), "Sevilla Atlético");
  assert.equal(normalizeTeamName("Valencia II", false), "Valencia Mestalla");
  assert.equal(normalizeTeamName("Athletic Club II", false), "Bilbao Athletic");
  assert.equal(normalizeTeamName("FC Barcelona II", false), "FC Barcelona Atlètic");
});

test("getCurrentSeasonYear and getSeasonLabel calculate active season dynamically", async () => {
  const { getCurrentSeasonYear, getSeasonLabel } = await import(
    "../../src/lib/sports-api/types.ts"
  );

  // Without arguments, resolves dynamically according to current system date
  const dynamicCurrentYear = getCurrentSeasonYear();
  const now = new Date();
  const expectedCurrentYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  assert.equal(dynamicCurrentYear, expectedCurrentYear);
  assert.equal(getSeasonLabel(), getSeasonLabel(expectedCurrentYear));

  // October 2026 -> season 2026, label 2026/27
  const oct2026 = new Date("2026-10-13T12:00:00Z");
  assert.equal(getCurrentSeasonYear(oct2026), 2026);
  assert.equal(getSeasonLabel(getCurrentSeasonYear(oct2026)), "2026/27");

  // February 2027 -> season 2026, label 2026/27 (second half of 2026/27 season)
  const feb2027 = new Date("2027-02-15T12:00:00Z");
  assert.equal(getCurrentSeasonYear(feb2027), 2026);
  assert.equal(getSeasonLabel(getCurrentSeasonYear(feb2027)), "2026/27");

  // August 2027 -> season 2027, label 2027/28 (kickoff of next season)
  const aug2027 = new Date("2027-08-20T12:00:00Z");
  assert.equal(getCurrentSeasonYear(aug2027), 2027);
  assert.equal(getSeasonLabel(getCurrentSeasonYear(aug2027)), "2027/28");
});
