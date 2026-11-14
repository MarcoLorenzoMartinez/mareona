import test from "node:test";
import assert from "node:assert/strict";
import {
  transformEspnMatchDetail,
  espnMatchSummaryResponseSchema,
  normalizeCompetitionName,
  CANONICAL_LEAGUE_NAME,
  type EspnMatchSummaryResponse,
} from "../../src/lib/sports-api/types.ts";

test("espnMatchSummaryResponseSchema successfully parses full finished match summary", () => {
  const samplePayload = {
    header: {
      id: "401883186",
      league: {
        id: "3921",
        name: "Spanish LALIGA 2",
      },
      season: {
        year: 2026,
        name: "2026-27 Spanish LALIGA 2",
      },
      competitions: [
        {
          id: "401883186",
          date: "2026-10-11T19:00Z",
          timeValid: true,
          status: {
            type: {
              state: "post",
              description: "Full Time",
            },
          },
          competitors: [
            {
              id: "3842",
              homeAway: "home",
              score: "0",
              team: {
                id: "3842",
                displayName: "Cádiz",
                logos: [{ href: "https://a.espncdn.com/i/teamlogos/soccer/500/3842.png" }],
              },
            },
            {
              id: "3788",
              homeAway: "away",
              score: "1",
              team: {
                id: "3788",
                displayName: "Sporting Gijón",
                logos: [{ href: "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png" }],
              },
            },
          ],
        },
      ],
    },
    gameInfo: {
      venue: {
        id: "1963",
        fullName: "Estadio Nuevo Mirandilla",
        address: {
          city: "Cádiz",
          country: "Spain",
        },
      },
      attendance: 15978,
    },
  };

  const parsed = espnMatchSummaryResponseSchema.safeParse(samplePayload);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const detail = transformEspnMatchDetail(parsed.data, 9);
  assert.ok(detail);
  assert.equal(detail.externalId, "401883186");
  assert.equal(detail.matchday, 9);
  assert.equal(detail.status, "finished");
  assert.equal(detail.competition, "LaLiga Hypermotion");
  assert.equal(detail.homeScore, 0);
  assert.equal(detail.awayScore, 1);
  assert.equal(detail.homeTeam.name, "Cádiz");
  assert.equal(detail.homeTeam.isSporting, false);
  // Canonical name rule strictly enforced
  assert.equal(detail.awayTeam.name, "Real Sporting");
  assert.equal(detail.awayTeam.isSporting, true);
  assert.equal(detail.venue?.name, "Estadio Nuevo Mirandilla");
  assert.equal(detail.venue?.city, "Cádiz");
  assert.equal(detail.attendance, 15978);
});

test("transformEspnMatchDetail correctly handles scheduled match with no attendance", () => {
  const scheduledData: EspnMatchSummaryResponse = {
    header: {
      id: "401883155",
      league: {
        id: "3921",
        name: "Spanish LALIGA 2",
      },
      competitions: [
        {
          id: "401883155",
          date: "2026-10-17T16:30Z",
          timeValid: true,
          status: {
            type: {
              state: "pre",
              description: "Scheduled",
            },
          },
          competitors: [
            {
              id: "3788",
              homeAway: "home",
              team: {
                id: "3788",
                displayName: "Sporting Gijón",
                logos: [{ href: "https://a.espncdn.com/i/teamlogos/soccer/500/3788.png" }],
              },
            },
            {
              id: "2737",
              homeAway: "away",
              team: {
                id: "2737",
                displayName: "Albacete",
                logos: [{ href: "https://a.espncdn.com/i/teamlogos/soccer/500/2737.png" }],
              },
            },
          ],
        },
      ],
    },
    gameInfo: {
      venue: {
        id: "10640",
        fullName: "Estadio El Molinón-Enrique Castro Quini",
        address: {
          city: "Gijón",
          country: "Spain",
        },
      },
    },
  };

  const detail = transformEspnMatchDetail(scheduledData, 10);
  assert.ok(detail);
  assert.equal(detail.externalId, "401883155");
  assert.equal(detail.matchday, 10);
  assert.equal(detail.status, "scheduled");
  assert.equal(detail.homeScore, null);
  assert.equal(detail.awayScore, null);
  assert.equal(detail.homeTeam.name, "Real Sporting");
  assert.equal(detail.homeTeam.isSporting, true);
  assert.equal(detail.awayTeam.name, "Albacete");
  assert.equal(detail.venue?.name, "Estadio El Molinón-Enrique Castro Quini");
  assert.equal(detail.attendance, null);
  assert.equal(detail.isTimeConfirmed, true);
});

test("transformEspnMatchDetail correctly marks isTimeConfirmed = false when kickoff hour is TBD", () => {
  const tbdData: EspnMatchSummaryResponse = {
    header: {
      id: "401883106",
      league: {
        id: "3921",
        name: "Spanish LALIGA 2",
      },
      competitions: [
        {
          id: "401883106",
          date: "2026-11-29T20:00Z",
          status: {
            type: {
              state: "pre",
              description: "Scheduled",
              detail: "11/29 - TBD",
              shortDetail: "TBD",
            },
          },
          competitors: [
            {
              id: "6832",
              homeAway: "home",
              team: {
                id: "6832",
                displayName: "Almería",
              },
            },
            {
              id: "3788",
              homeAway: "away",
              team: {
                id: "3788",
                displayName: "Sporting Gijón",
              },
            },
          ],
        },
      ],
    },
    gameInfo: {
      venue: {
        fullName: "Power Horse Stadium",
      },
    },
  };

  const detail = transformEspnMatchDetail(tbdData, 16);
  assert.ok(detail);
  assert.equal(detail.matchday, 16);
  assert.equal(detail.status, "scheduled");
  assert.equal(detail.isTimeConfirmed, false);
});

test("normalizeCompetitionName maps vendor names to canonical LaLiga Hypermotion", () => {
  assert.equal(normalizeCompetitionName("Spanish LALIGA 2"), CANONICAL_LEAGUE_NAME);
  assert.equal(normalizeCompetitionName("Spanish La Liga 2"), CANONICAL_LEAGUE_NAME);
  assert.equal(normalizeCompetitionName("Segunda División"), CANONICAL_LEAGUE_NAME);
  assert.equal(normalizeCompetitionName("LaLiga Hypermotion"), CANONICAL_LEAGUE_NAME);
  assert.equal(normalizeCompetitionName(undefined), CANONICAL_LEAGUE_NAME);
  assert.equal(normalizeCompetitionName(null), CANONICAL_LEAGUE_NAME);
  assert.equal(normalizeCompetitionName("Copa del Rey"), "Copa del Rey");
});

test("espnMatchSummaryResponseSchema successfully parses pre-game summary with { didSub: false } objects and nullable score", () => {
  const preGamePayload = {
    header: {
      id: "401883134",
      league: { id: "3921", name: "Spanish LALIGA 2" },
      competitions: [
        {
          id: "401883134",
          date: "2026-11-14T15:15Z",
          timeValid: true,
          status: {
            type: {
              state: "pre",
              description: "Scheduled",
            },
          },
          competitors: [
            {
              id: "20983",
              homeAway: "home",
              score: null,
              team: { id: "20983", displayName: "Real Sociedad B" },
            },
            {
              id: "3788",
              homeAway: "away",
              score: null,
              team: { id: "3788", displayName: "Sporting Gijón" },
            },
          ],
        },
      ],
    },
    rosters: [
      {
        team: { id: "20983", displayName: "Real Sociedad B" },
        formation: "4-2-3-1",
        roster: [
          {
            active: true,
            starter: true,
            jersey: "1",
            formationPlace: "1",
            subbedIn: { didSub: false },
            subbedOut: { didSub: false },
            athlete: {
              id: "300101",
              displayName: "Aitor Fraga",
              fullName: "Aitor Fraga",
            },
            position: { name: "Goalkeeper", abbreviation: "G" },
          },
          {
            active: true,
            starter: false,
            jersey: "12",
            subbedIn: { didSub: false },
            subbedOut: { didSub: false },
            athlete: {
              id: "300102",
              displayName: "Iñaki Rupérez",
            },
            position: { name: "Defender", abbreviation: "D" },
          },
        ],
      },
      {
        team: { id: "3788", displayName: "Sporting Gijón" },
        formation: "4-3-3",
        roster: [
          {
            active: true,
            starter: true,
            jersey: "1",
            formationPlace: "1",
            subbedIn: false,
            subbedOut: false,
            athlete: {
              id: "200900",
              displayName: "Rubén Yáñez",
            },
            position: { name: "Goalkeeper", abbreviation: "GK" },
          },
          {
            active: true,
            starter: false,
            jersey: "17",
            subbedIn: { didSub: true },
            subbedOut: { didSub: false },
            athlete: {
              id: "200901",
              displayName: "Jonathan Dubasin",
            },
            position: { name: "Forward", abbreviation: "F" },
          },
        ],
      },
    ],
  };

  const parsed = espnMatchSummaryResponseSchema.safeParse(preGamePayload);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const detail = transformEspnMatchDetail(parsed.data, 15);
  assert.ok(detail);
  assert.equal(detail.status, "scheduled");
  assert.equal(detail.homeScore, null);
  assert.equal(detail.awayScore, null);

  // Home Lineup
  assert.ok(detail.homeLineup);
  assert.equal(detail.homeLineup.starters.length, 1);
  assert.equal(detail.homeLineup.starters[0].name, "Aitor Fraga");
  assert.equal(detail.homeLineup.starters[0].subbedIn, false);
  assert.equal(detail.homeLineup.starters[0].subbedOut, false);
  assert.equal(detail.homeLineup.substitutes.length, 1);
  assert.equal(detail.homeLineup.substitutes[0].name, "Iñaki Rupérez");
  assert.equal(detail.homeLineup.substitutes[0].subbedIn, false);

  // Away Lineup (Sporting)
  assert.ok(detail.awayLineup);
  assert.equal(detail.awayLineup.starters.length, 1);
  assert.equal(detail.awayLineup.starters[0].name, "Rubén Yáñez");
  assert.equal(detail.awayLineup.starters[0].subbedIn, false);
  assert.equal(detail.awayLineup.substitutes.length, 1);
  assert.equal(detail.awayLineup.substitutes[0].name, "Jonathan Dubasin");
  assert.equal(detail.awayLineup.substitutes[0].subbedIn, true);
});

