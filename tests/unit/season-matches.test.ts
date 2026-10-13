import test from "node:test";
import assert from "node:assert/strict";
import {
  transformEspnEvent,
  type EspnEvent,
} from "../../src/lib/sports-api/espn.ts";

test("transformEspnEvent correctly captures isTimeConfirmed = true for confirmed kickoff", () => {
  const confirmedEvent: EspnEvent = {
    id: "401883155",
    date: "2026-10-17T16:30Z",
    name: "Albacete at Sporting Gijon",
    timeValid: true,
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
          fullName: "Estadio El Molinon-Enrique Castro Quini",
        },
        competitors: [
          {
            id: "3788",
            homeAway: "home",
            team: {
              id: "3788",
              displayName: "Sporting Gijon",
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

  const match = transformEspnEvent(confirmedEvent, 10);
  assert.ok(match);
  assert.equal(match.matchday, 10);
  assert.equal(match.isTimeConfirmed, true);
  assert.equal(match.status, "scheduled");
  assert.equal(match.homeTeam.name, "Real Sporting");
  assert.equal(match.homeTeam.isSporting, true);
  assert.equal(match.awayTeam.name, "Albacete");
  assert.equal(match.homeScore, null);
  assert.equal(match.awayScore, null);
});

test("transformEspnEvent correctly captures isTimeConfirmed = false when kickoff hour is TBD", () => {
  const unconfirmedEvent: EspnEvent = {
    id: "401883158",
    date: "2026-11-08T20:00Z",
    name: "Real Valladolid at Sporting Gijon",
    timeValid: false,
    competitions: [
      {
        id: "401883158",
        status: {
          type: {
            state: "pre",
            description: "Scheduled",
          },
        },
        venue: {
          fullName: "Estadio El Molinon-Enrique Castro Quini",
        },
        competitors: [
          {
            id: "3788",
            homeAway: "home",
            team: {
              id: "3788",
              displayName: "Sporting Gijon",
              logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png",
            },
          },
          {
            id: "2759",
            homeAway: "away",
            team: {
              id: "2759",
              displayName: "Real Valladolid",
              logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2759.png",
            },
          },
        ],
      },
    ],
  };

  const match = transformEspnEvent(unconfirmedEvent, 13);
  assert.ok(match);
  assert.equal(match.matchday, 13);
  assert.equal(match.isTimeConfirmed, false);
  assert.equal(match.status, "scheduled");
  assert.equal(match.homeTeam.name, "Real Sporting");
  assert.equal(match.awayTeam.name, "Real Valladolid");
});

test("transformEspnEvent correctly captures finished match with scores and venue", () => {
  const finishedEvent: EspnEvent = {
    id: "401883150",
    date: "2026-10-11T19:00Z",
    name: "Sporting Gijon at Cadiz",
    timeValid: true,
    competitions: [
      {
        id: "401883150",
        status: {
          type: {
            state: "post",
            description: "Full Time",
          },
        },
        venue: {
          fullName: "Estadio Nuevo Mirandilla",
        },
        competitors: [
          {
            id: "3842",
            homeAway: "home",
            score: "0",
            team: {
              id: "3842",
              displayName: "Cadiz",
              logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3842.png",
            },
          },
          {
            id: "3788",
            homeAway: "away",
            score: "1",
            team: {
              id: "3788",
              displayName: "Sporting Gijon",
              logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png",
            },
          },
        ],
      },
    ],
  };

  const match = transformEspnEvent(finishedEvent, 9);
  assert.ok(match);
  assert.equal(match.matchday, 9);
  assert.equal(match.status, "finished");
  assert.equal(match.homeScore, 0);
  assert.equal(match.awayScore, 1);
  assert.equal(match.homeTeam.name, "Cadiz");
  assert.equal(match.homeTeam.isSporting, false);
  assert.equal(match.awayTeam.name, "Real Sporting");
  assert.equal(match.awayTeam.isSporting, true);
  assert.equal(match.venue, "Estadio Nuevo Mirandilla");
});
