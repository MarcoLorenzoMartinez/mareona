import test from "node:test";
import assert from "node:assert/strict";
import { lookupPlayerStats, normalizePlayerSearchKey } from "../../src/lib/sports-api/player-stats-matcher.ts";
import type { DomainPlayerMatchStats } from "../../src/lib/sports-api/types.ts";

test("normalizePlayerSearchKey removes accents and lowercases", () => {
  assert.equal(normalizePlayerSearchKey("Àlex Corredera"), "alex corredera");
  assert.equal(normalizePlayerSearchKey("Álvaro Rodríguez"), "alvaro rodriguez");
  assert.equal(normalizePlayerSearchKey("Guille Rosas"), "guille rosas");
});

test("lookupPlayerStats correctly resolves player with accent differences", () => {
  const dummyStats: DomainPlayerMatchStats = {
    id: 102938,
    name: "Alex Corredera",
    shirtNumber: "14",
    isGoalkeeper: false,
    rating: 7.7,
    minutesPlayed: 90,
    goals: 0,
    assists: 1,
    expectedGoals: 0.12,
    expectedGoalsOnTarget: null,
    chancesCreated: 2,
    totalShots: 1,
    shotsOnTarget: 0,
    touchesInBox: 1,
    passesFinalThird: 8,
    touches: 65,
    dispossessed: 1,
    accuratePasses: 42,
    totalPasses: 48,
    accurateLongBalls: 3,
    totalLongBalls: 4,
    defensiveActions: 4,
    tacklesWon: 2,
    interceptions: 1,
    recoveries: 5,
    clearances: 1,
    blocks: 0,
    dribbledPast: 0,
    duelsWon: 5,
    duelsLost: 2,
    groundDuelsWon: 4,
    totalGroundDuels: 5,
    aerialDuelsWon: 1,
    totalAerialDuels: 2,
    wasFouled: 2,
    foulsCommitted: 1,
  };

  const statsMap: Record<string, DomainPlayerMatchStats> = {
    "alex corredera": dummyStats,
    "102938": dummyStats,
    "jersey_14": dummyStats,
  };

  // 1. Domain player with ESPN grave accent "Àlex Corredera"
  const playerFromEspn = {
    id: "espn-12345",
    name: "Àlex Corredera",
    jersey: 14,
  };

  // Should match by accent-stripped name
  const matchByName = lookupPlayerStats(playerFromEspn, statsMap);
  assert.ok(matchByName);
  assert.equal(matchByName.rating, 7.7);

  // Should match by FotMob starter ID (102938)
  const matchById = lookupPlayerStats(playerFromEspn, statsMap, 102938);
  assert.ok(matchById);
  assert.equal(matchById.id, 102938);

  // 2. Matching by jersey fallback when name has discrepancies
  const playerWithTypo = {
    id: "espn-9999",
    name: "Corredera A.",
    jersey: 14,
  };
  const matchByJersey = lookupPlayerStats(playerWithTypo, statsMap);
  assert.ok(matchByJersey);
  assert.equal(matchByJersey.id, 102938);
});
