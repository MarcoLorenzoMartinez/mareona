import test from "node:test";
import assert from "node:assert/strict";
import { transformFotMobAdvancedStats } from "../../src/lib/sports-api/fotmob.ts";
import { parseFotMobGoalAssists } from "../../src/lib/sports-api/fotmob-player-parser.ts";
import { parseFotMobTacticalLineups } from "../../src/lib/sports-api/fotmob-lineup-parser.ts";

test("transformFotMobAdvancedStats correctly maps shots, xG, and attacking zones", () => {
  const samplePayload = {
    general: {
      matchId: "5868484",
      homeTeam: { id: 8385, name: "Cádiz" },
      awayTeam: { id: 9869, name: "Sporting Gijón" },
    },
    content: {
      stats: {
        Periods: {
          All: {
            stats: [
              {
                title: "Top stats",
                stats: [
                  { title: "Expected goals (xG)", stats: ["0.75", "0.66"] },
                  { title: "xG open play", stats: ["0.71", "0.41"] },
                  { title: "xG set play", stats: ["0.04", "0.26"] },
                  { title: "Big chances", stats: [1, 0] },
                  { title: "Big chances missed", stats: [1, 0] },
                  { title: "Touches in opposition box", stats: [21, 20] },
                  { title: "Duels won", stats: [28, 36] },
                  { title: "Ground duels won", stats: ["19 (45%)", "23 (55%)"] },
                  { title: "Aerial duels won", stats: ["9 (41%)", "13 (59%)"] },
                ],
              },
            ],
          },
        },
      },
      shotmap: {
        shots: [
          {
            id: 101,
            eventType: "Miss",
            teamId: 8385,
            playerId: 501,
            playerName: "Chris Ramos",
            x: 88.5,
            y: 35.2,
            min: 24,
            isBlocked: false,
            isOnTarget: false,
            expectedGoals: 0.12,
            expectedGoalsOnTarget: null,
            shotType: "Header",
            situation: "FromCorner",
          },
          {
            id: 102,
            eventType: "Goal",
            teamId: 9869,
            playerId: 502,
            playerName: "Pablo García",
            x: 93.1,
            y: 45.8,
            min: 87,
            isBlocked: false,
            isOnTarget: true,
            onGoalShot: { x: 1.06, y: 0.25 },
            goalCrossedZ: 0.94,
            expectedGoals: 0.044,
            expectedGoalsOnTarget: 0.083,
            shotType: "RightFoot",
            situation: "IndividualPlay",
          },
        ],
      },
      attackingZones: {
        home: { total: { left: 45, center: 21, right: 34 } },
        away: { total: { left: 53, center: 18, right: 29 } },
      },
      momentum: {
        main: {
          data: [
            { minute: 1, value: 0 },
            { minute: 2, value: -5 },
            { minute: 87, value: -25 },
          ],
        },
      },
      playerStats: {
        "573780": {
          id: 573780,
          name: "Jorge Sáenz",
          shirtNumber: "23",
          teamId: 9869,
          isGoalkeeper: false,
          stats: [
            {
              title: "Top stats",
              stats: {
                "FotMob rating": { stat: { value: 7.35 } },
                "Minutes played": { stat: { value: 90 } },
                "Accurate passes": { stat: { value: 34, total: 40 } },
                "Defensive actions": { stat: { value: 14 } },
              },
            },
          ],
        },
      },
    },
  };

  const result = transformFotMobAdvancedStats(samplePayload, 8385, 9869);
  assert.ok(result);

  // 1. Verify totals
  assert.equal(result.homeXg, 0.75);
  assert.equal(result.awayXg, 0.66);
  assert.equal(result.homeXgOpenPlay, 0.71);
  assert.equal(result.awayXgOpenPlay, 0.41);
  assert.equal(result.homeXgSetPlay, 0.04);
  assert.equal(result.awayXgSetPlay, 0.26);
  assert.equal(result.homeBigChances, 1);
  assert.equal(result.awayBigChances, 0);
  assert.equal(result.homeBoxTouches, 21);
  assert.equal(result.awayBoxTouches, 20);
  assert.equal(result.homeDuelsWon, 28);
  assert.equal(result.awayDuelsWon, 36);
  assert.equal(result.homeGroundDuelsWon, "19 (45%)");
  assert.equal(result.awayGroundDuelsWon, "23 (55%)");

  // 2. Verify shots
  assert.equal(result.shots.length, 2);
  const homeShot = result.shots[0];
  assert.equal(homeShot.isHome, true);
  assert.equal(homeShot.isSporting, false);
  assert.equal(homeShot.expectedGoals, 0.12);
  assert.equal(homeShot.eventType, "Miss");
  assert.equal(homeShot.onGoalShot, null);

  const goalShot = result.shots[1];
  assert.equal(goalShot.isHome, false);
  assert.equal(goalShot.isSporting, true);
  assert.equal(goalShot.isGoal, true);
  assert.equal(goalShot.playerName, "Pablo García");
  assert.equal(goalShot.expectedGoals, 0.044);
  assert.equal(goalShot.expectedGoalsOnTarget, 0.083);
  assert.deepEqual(goalShot.onGoalShot, { x: 1.06, y: 0.25 });
  assert.equal(goalShot.goalCrossedZ, 0.94);

  // 3. Verify attacking zones & momentum
  assert.ok(result.attackingZones);
  assert.equal(result.attackingZones.home.left, 45);
  assert.equal(result.attackingZones.away.left, 53);

  assert.ok(result.momentum);
  assert.equal(result.momentum.length, 3);

  // 4. Verify player stats
  assert.ok(result.playerStats);
  const jorge = result.playerStats["jorge sáenz"];
  assert.ok(jorge);
  assert.equal(jorge.id, 573780);
  assert.equal(jorge.rating, 7.35);
  assert.equal(jorge.minutesPlayed, 90);
  assert.equal(jorge.accuratePasses, 34);
  assert.equal(jorge.totalPasses, 40);
  assert.equal(jorge.defensiveActions, 14);
});

test("parseFotMobGoalAssists extracts assists accurately from matchFacts/header events", () => {
  const sampleFacts = {
    events: {
      events: {
        homeTeamGoals: {
          "Juan Otero": [
            { timeStr: 40, nameStr: "Juan Otero", assistStr: "assist by Alex Corredera" },
          ],
        },
        awayTeamGoals: {
          "Dubasin": [
            { timeStr: 87, nameStr: "Jonathan Dubasin", assistStr: "assist by Pablo García" },
          ],
        },
      },
    },
  };

  const assists = parseFotMobGoalAssists(sampleFacts);
  assert.equal(assists.length, 2);
  assert.equal(assists[0]?.minute, 40);
  assert.equal(assists[0]?.scorerName, "Juan Otero");
  assert.equal(assists[0]?.assistantName, "Alex Corredera");

  assert.equal(assists[1]?.minute, 87);
  assert.equal(assists[1]?.scorerName, "Jonathan Dubasin");
  assert.equal(assists[1]?.assistantName, "Pablo García");
});

test("parseFotMobTacticalLineups maps formations, coordinates, and photo URLs", () => {
  const sampleLineupPayload = {
    homeTeam: {
      id: 9869,
      name: "Sporting Gijon",
      formation: "4-4-2",
      starters: [
        {
          id: 101,
          name: "Rubén Yáñez",
          shirtNumber: "1",
          verticalLayout: { x: 0.5, y: 0.1 },
          performance: { rating: 7.2 },
        },
      ],
    },
    awayTeam: {
      id: 8888,
      name: "CD Sabadell",
      formation: "3-1-4-2",
      starters: [
        {
          id: 202,
          name: "Diego Fuoli",
          shirtNumber: "1",
          verticalLayout: { x: 0.5, y: 0.1 },
          performance: { rating: 8.5 },
        },
      ],
    },
  };

  const result = parseFotMobTacticalLineups(sampleLineupPayload, 9869, 8888);
  assert.ok(result);
  assert.equal(result.home.formation, "4-4-2");
  assert.equal(result.home.starters.length, 1);
  assert.equal(result.home.starters[0]?.name, "Rubén Yáñez");
  assert.equal(
    result.home.starters[0]?.photoUrl,
    "https://images.fotmob.com/image_resources/playerimages/101.png"
  );
  assert.equal(result.home.starters[0]?.x, 0.5);
  assert.equal(result.home.starters[0]?.y, 0.1);
  assert.equal(result.home.starters[0]?.rating, 7.2);

  assert.equal(result.away.formation, "3-1-4-2");
  assert.equal(result.away.starters.length, 1);
  assert.equal(result.away.starters[0]?.name, "Diego Fuoli");
  assert.equal(
    result.away.starters[0]?.photoUrl,
    "https://images.fotmob.com/image_resources/playerimages/202.png"
  );
  assert.equal(result.away.starters[0]?.x, 0.5);
  assert.equal(result.away.starters[0]?.y, 0.1);
  assert.equal(result.away.starters[0]?.rating, 8.5);
});


