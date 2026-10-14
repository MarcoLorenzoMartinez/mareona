import test from "node:test";
import assert from "node:assert/strict";
import { transformFotMobAdvancedStats } from "../../src/lib/sports-api/fotmob.ts";

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
                  { title: "Big chances", stats: [1, 0] },
                  { title: "Big chances missed", stats: [1, 0] },
                  { title: "Touches in opposition box", stats: [21, 20] },
                  { title: "Duels won", stats: [28, 36] },
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
    },
  };

  const result = transformFotMobAdvancedStats(samplePayload, 8385, 9869);
  assert.ok(result);

  // 1. Verify totals
  assert.equal(result.homeXg, 0.75);
  assert.equal(result.awayXg, 0.66);
  assert.equal(result.homeBigChances, 1);
  assert.equal(result.awayBigChances, 0);
  assert.equal(result.homeBoxTouches, 21);
  assert.equal(result.awayBoxTouches, 20);
  assert.equal(result.homeDuelsWon, 28);
  assert.equal(result.awayDuelsWon, 36);

  // 2. Verify shots
  assert.equal(result.shots.length, 2);
  const homeShot = result.shots[0];
  assert.equal(homeShot.isHome, true);
  assert.equal(homeShot.isSporting, false);
  assert.equal(homeShot.expectedGoals, 0.12);
  assert.equal(homeShot.eventType, "Miss");

  const goalShot = result.shots[1];
  assert.equal(goalShot.isHome, false);
  assert.equal(goalShot.isSporting, true);
  assert.equal(goalShot.isGoal, true);
  assert.equal(goalShot.playerName, "Pablo García");
  assert.equal(goalShot.expectedGoals, 0.044);
  assert.equal(goalShot.expectedGoalsOnTarget, 0.083);

  // 3. Verify attacking zones & momentum
  assert.ok(result.attackingZones);
  assert.equal(result.attackingZones.home.left, 45);
  assert.equal(result.attackingZones.away.left, 53);

  assert.ok(result.momentum);
  assert.equal(result.momentum.length, 3);
});
