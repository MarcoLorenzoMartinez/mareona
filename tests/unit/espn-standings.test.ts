import test from "node:test";
import assert from "node:assert/strict";
import {
  espnStandingsResponseSchema,
  transformEspnStandingEntry,
  transformEspnEvent,
  type EspnEvent,
} from "../../src/lib/sports-api/espn.ts";

test("ESPN standings schema successfully parses live 2026/27 payload", () => {
  const samplePayload = {
    name: "Spanish LALIGA 2",
    children: [
      {
        standings: {
          entries: [
            {
              team: {
                id: "3788",
                displayName: "Sporting Gijón",
                abbreviation: "RSG",
                logos: [
                  {
                    href: "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png",
                  },
                ],
              },
              stats: [
                { name: "rank", value: 6 },
                { name: "gamesPlayed", value: 9 },
                { name: "wins", value: 5 },
                { name: "ties", value: 1 },
                { name: "losses", value: 3 },
                { name: "pointsFor", value: 9 },
                { name: "pointsAgainst", value: 8 },
                { name: "points", value: 16 },
              ],
            },
          ],
        },
      },
    ],
  };

  const parsed = espnStandingsResponseSchema.safeParse(samplePayload);
  assert.equal(parsed.success, true);

  if (parsed.success) {
    const entry = parsed.data.children[0]?.standings.entries[0];
    assert.ok(entry);
    const domainRow = transformEspnStandingEntry(entry);
    assert.equal(domainRow.position, 6);
    assert.equal(domainRow.teamName, "Real Sporting");
    assert.equal(domainRow.points, 16);
    assert.equal(domainRow.isSporting, true);
    assert.equal(domainRow.played, 9);
    assert.equal(domainRow.won, 5);
    assert.equal(domainRow.drawn, 1);
    assert.equal(domainRow.lost, 3);
    assert.equal(domainRow.crestUrl, "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png");
  }
});

test("transformEspnEvent correctly maps scheduled match", () => {
  const sampleEvent: EspnEvent = {
    id: "401883155",
    date: "2026-10-17T16:30Z",
    name: "Albacete at Sporting Gijón",
    competitions: [
      {
        id: "401883155",
        status: {
          type: {
            state: "pre",
            description: "Scheduled",
          },
        },
        venue: {
          fullName: "Estadio El Molinón-Enrique Castro Quini",
        },
        competitors: [
          {
            id: "3788",
            homeAway: "home",
            team: {
              id: "3788",
              displayName: "Sporting Gijón",
              logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png",
            },
          },
          {
            id: "2737",
            homeAway: "away",
            team: {
              id: "2737",
              displayName: "Albacete",
              logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2737.png",
            },
          },
        ],
      },
    ],
  };

  const match = transformEspnEvent(sampleEvent, 10);
  assert.ok(match);
  assert.equal(match.matchday, 10);
  assert.equal(match.status, "scheduled");
  assert.equal(match.homeTeam.name, "Real Sporting");
  assert.equal(match.homeTeam.isSporting, true);
  assert.equal(match.awayTeam.name, "Albacete");
  assert.equal(match.awayTeam.isSporting, false);
  assert.equal(match.venue, "Estadio El Molinón-Enrique Castro Quini");
});
