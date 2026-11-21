import test from "node:test";
import assert from "node:assert/strict";
import {
  transformEspnMatchDetail,
  espnMatchSummaryResponseSchema,
  normalizeAthleteName,
} from "../../src/lib/sports-api/types.ts";

test("transformEspnMatchDetail parses extended match statistics, events, and rosters", () => {
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
              },
            },
            {
              id: "3788",
              homeAway: "away",
              score: "1",
              team: {
                id: "3788",
                displayName: "Sporting Gijón",
              },
            },
          ],
        },
      ],
    },
    boxscore: {
      teams: [
        {
          team: { id: "3842", displayName: "Cádiz" },
          statistics: [
            { name: "possessionPct", displayValue: "52%", label: "Posesión" },
            { name: "shotsTotal", displayValue: "14", label: "Tiros totales" },
            { name: "shotsOnTarget", displayValue: "3", label: "Tiros a puerta" },
            { name: "foulsCommitted", displayValue: "12", label: "Faltas" },
            { name: "yellowCards", displayValue: "2", label: "Tarjetas amarillas" },
            { name: "saves", displayValue: "2", label: "Paradas" },
          ],
        },
        {
          team: { id: "3788", displayName: "Sporting Gijón" },
          statistics: [
            { name: "possessionPct", displayValue: "48%", label: "Posesión" },
            { name: "shotsTotal", displayValue: "9", label: "Tiros totales" },
            { name: "shotsOnTarget", displayValue: "4", label: "Tiros a puerta" },
            { name: "foulsCommitted", displayValue: "15", label: "Faltas" },
            { name: "yellowCards", displayValue: "3", label: "Tarjetas amarillas" },
            { name: "saves", displayValue: "3", label: "Paradas" },
          ],
        },
      ],
    },
    keyEvents: [
      {
        id: "ev1",
        type: { id: "1", text: "Goal", type: "goal" },
        clock: { displayValue: "34'" },
        scoringPlay: true,
        team: { id: "3788" },
        participants: [
          { athlete: { id: "p1", displayName: "Gaspar Campos", jersey: "7" } },
          { athlete: { id: "p2", displayName: "Cote", jersey: "3" } },
        ],
      },
      {
        id: "ev2",
        type: { id: "2", text: "Yellow Card", type: "yellow-card" },
        clock: { displayValue: "42'" },
        scoringPlay: false,
        team: { id: "3842" },
        participants: [
          { athlete: { id: "p3", displayName: "Fali", jersey: "3" } },
        ],
      },
      {
        id: "ev3",
        type: { id: "3", text: "Substitution", type: "substitution" },
        clock: { displayValue: "65'" },
        scoringPlay: false,
        team: { id: "3788" },
        participants: [
          { athlete: { id: "p4", displayName: "Dani Queipo", jersey: "9" } },
          { athlete: { id: "p1", displayName: "Gaspar Campos", jersey: "7" } },
        ],
      },
    ],
    rosters: [
      {
        team: { id: "3842", displayName: "Cádiz" },
        formation: "4-4-2",
        roster: [
          {
            starter: true,
            jersey: "1",
            formationPlace: "1",
            athlete: { id: "c1", displayName: "David Gil", position: { abbreviation: "G" } },
          },
        ],
      },
      {
        team: { id: "3788", displayName: "Sporting Gijón" },
        formation: "4-2-3-1",
        coach: [{ id: "c_sp", firstName: "Rubén", lastName: "Albés" }],
        roster: [
          {
            starter: true,
            jersey: "1",
            formationPlace: "1",
            athlete: { id: "s1", displayName: "Rubén Yáñez", position: { abbreviation: "G" } },
          },
          {
            starter: false,
            subbedIn: true,
            jersey: "9",
            athlete: { id: "p4", displayName: "Dani Queipo", position: { abbreviation: "M" } },
          },
        ],
      },
    ],
  };

  const parsed = espnMatchSummaryResponseSchema.safeParse(samplePayload);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const detail = transformEspnMatchDetail(parsed.data, 9);
  assert.ok(detail);

  // 1. Verify statistics
  assert.ok(detail.statGroups.length > 0);
  const controlGroup = detail.statGroups.find((g) => g.groupKey === "control");
  assert.ok(controlGroup);
  const possessionStat = controlGroup.stats.find((i) => i.key === "possessionPct");
  assert.ok(possessionStat);
  assert.equal(possessionStat.homeValue, "52%");
  assert.equal(possessionStat.awayValue, "48%");
  assert.equal(possessionStat.homeNumeric, 52);
  assert.equal(possessionStat.awayNumeric, 48);

  // 2. Verify events timeline
  assert.equal(detail.events.length, 3);
  const goalEvent = detail.events[0];
  assert.equal(goalEvent.type, "goal");
  assert.equal(goalEvent.minute, "34'");
  assert.equal(goalEvent.player.name, "Gaspar Campos");
  assert.equal(goalEvent.secondaryPlayer?.name, "Cote");
  assert.equal(goalEvent.isHome, false);
  assert.equal(goalEvent.score, "0 - 1");

  const subEvent = detail.events[2];
  assert.equal(subEvent.type, "substitution");
  assert.equal(subEvent.player.name, "Dani Queipo");
  assert.equal(subEvent.secondaryPlayer?.name, "Gaspar Campos");

  // 3. Verify lineups
  assert.ok(detail.homeLineup);
  assert.equal(detail.homeLineup.formation, "4-4-2");
  assert.equal(detail.homeLineup.starters.length, 1);

  assert.ok(detail.awayLineup);
  assert.equal(detail.awayLineup.formation, "4-2-3-1");
  assert.equal(detail.awayLineup.starters.length, 1);
  assert.equal(detail.awayLineup.substitutes.length, 1);
  assert.equal(detail.awayLineup.substitutes[0].subbedIn, true);
});

test("normalizeAthleteName converts incomplete vendor name for id 209736 without misnaming other Jorges", () => {
  const byId = normalizeAthleteName({ id: "209736", displayName: "Jorge" });
  assert.equal(byId.name, "Jorge Sáenz");
  assert.equal(byId.shortName, "J. Sáenz");

  const rivalJorge = normalizeAthleteName({ id: "999999", displayName: "Jorge" });
  assert.equal(rivalJorge.name, "Jorge");
  assert.equal(rivalJorge.shortName, "Jorge");

  const other = normalizeAthleteName({ id: "123", displayName: "Cote" });
  assert.equal(other.name, "Cote");
  assert.equal(other.shortName, "Cote");
});

test("transformEspnMatchDetail maps missed penalty correctly and does not produce phantom goals in 0-0 match", () => {
  const sample00 = {
    header: {
      id: "401883257",
      league: { id: "3921", name: "Spanish LALIGA 2" },
      season: { year: 2026, name: "2026-27 Spanish LALIGA 2" },
      competitions: [
        {
          id: "401883257",
          date: "2026-08-17T17:00Z",
          timeValid: true,
          status: { type: { state: "post", completed: true, description: "Full Time" } },
          competitors: [
            { id: "3788", homeAway: "home", score: "0", team: { id: "3788", displayName: "Sporting Gijón" } },
            { id: "11487", homeAway: "away", score: "0", team: { id: "11487", displayName: "CD Sabadell" } },
          ],
        },
      ],
    },
    keyEvents: [
      {
        id: "51029903",
        type: { id: "113", text: "Penalty - Missed", type: "penalty---missed" },
        text: "Yanis Rahmani (CD Sabadell) Penalty - Missed at 13'",
        clock: { value: 733, displayValue: "13'" },
        scoringPlay: false,
        team: { id: "11487", displayName: "CD Sabadell" },
        participants: [{ athlete: { id: "245840", displayName: "Yanis Rahmani" } }],
      },
    ],
  };

  const parsed = espnMatchSummaryResponseSchema.safeParse(sample00);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const detail = transformEspnMatchDetail(parsed.data, 1);
  assert.ok(detail);
  assert.equal(detail.homeScore, 0);
  assert.equal(detail.awayScore, 0);
  assert.equal(detail.events.length, 1);

  const penaltyEvent = detail.events[0];
  assert.equal(penaltyEvent.type, "penaltyMissed");
  assert.equal(penaltyEvent.minute, "13'");
  assert.equal(penaltyEvent.player.name, "Yanis Rahmani");
  assert.equal(penaltyEvent.score, undefined);
});

test("transformEspnMatchDetail maps Penalty - Scored to goal and detects double yellow card correctly", () => {
  const sampleMatch = {
    header: {
      id: "401883134",
      league: { id: "3921", name: "Spanish LALIGA 2" },
      season: { year: 2026, name: "2026-27 Spanish LALIGA 2" },
      competitions: [
        {
          id: "401883134",
          date: "2026-11-14T15:15Z",
          timeValid: true,
          status: { type: { state: "post", completed: true, description: "Full Time" } },
          competitors: [
            { id: "3742", homeAway: "home", score: "2", team: { id: "3742", displayName: "Real Sociedad B" } },
            { id: "3788", homeAway: "away", score: "2", team: { id: "3788", displayName: "Sporting Gijón" } },
          ],
        },
      ],
    },
    keyEvents: [
      {
        id: "ev1",
        type: { id: "98", text: "Penalty - Scored", type: "penalty---scored" },
        text: "Àlex Corredera (Sporting Gijón) Penalty - Scored at 7'",
        clock: { value: 420, displayValue: "7'" },
        scoringPlay: true,
        team: { id: "3788", displayName: "Sporting Gijón" },
        participants: [{ athlete: { id: "261615", displayName: "Àlex Corredera" } }],
      },
      {
        id: "ev2",
        type: { id: "94", text: "Yellow Card", type: "yellow-card" },
        text: "Àlex Corredera (Sporting Gijón) Yellow Card at 46'",
        clock: { value: 2760, displayValue: "46'" },
        scoringPlay: false,
        team: { id: "3788", displayName: "Sporting Gijón" },
        participants: [{ athlete: { id: "261615", displayName: "Àlex Corredera" } }],
      },
      {
        id: "ev3",
        type: { id: "93", text: "Red Card", type: "red-card" },
        text: "Àlex Corredera (Sporting Gijón) Red Card at 80'",
        clock: { value: 4800, displayValue: "80'" },
        scoringPlay: false,
        team: { id: "3788", displayName: "Sporting Gijón" },
        participants: [{ athlete: { id: "261615", displayName: "Àlex Corredera" } }],
      },
    ],
  };

  const parsed = espnMatchSummaryResponseSchema.safeParse(sampleMatch);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const detail = transformEspnMatchDetail(parsed.data, 14);
  assert.ok(detail);
  assert.equal(detail.events.length, 3);

  // 1. Min 7 Penalty - Scored must be a GOAL, not a red card
  const goalEvent = detail.events[0];
  assert.equal(goalEvent.type, "goal");
  assert.equal(goalEvent.minute, "7'");
  assert.equal(goalEvent.player.name, "Àlex Corredera");
  assert.equal(goalEvent.score, "0 - 1");
  assert.equal(goalEvent.isPenalty, true);

  // 2. Min 46 Yellow Card
  const yellowEvent = detail.events[1];
  assert.equal(yellowEvent.type, "yellowCard");
  assert.equal(yellowEvent.minute, "46'");

  // 3. Min 80 Red Card is flagged as double yellow because Corredera had yellow at 46'
  const redEvent = detail.events[2];
  assert.equal(redEvent.type, "redCard");
  assert.equal(redEvent.minute, "80'");
  assert.equal(redEvent.isSecondYellow, true);
});

