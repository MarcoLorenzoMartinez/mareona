import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { transformFotMobTeamStats } from "../../src/lib/sports-api/team-season-stats.ts";

describe("transformFotMobTeamStats", () => {
  it("transforms raw FotMob payload into clean TeamSeasonStats with ranks", () => {
    const raw = {
      stats: {
        teams: [
          {
            header: "Goals per match",
            participant: {
              value: 1.4,
              rank: 5,
              stat: { name: "goals_team_match", value: 1.4 },
            },
          },
          {
            header: "Expected goals",
            participant: {
              value: 18.2,
              rank: 3,
              stat: { name: "expected_goals_team", value: 18.2 },
            },
          },
          {
            header: "Average possession",
            participant: {
              value: 52.8,
              rank: 6,
              stat: { name: "possession_percentage_team", value: 52.8 },
            },
          },
          {
            header: "Attendance",
            participant: {
              value: 22100,
              rank: 2,
              stat: { name: "home_attendance_team", value: 22100 },
            },
          },
        ],
      },
      table: [
        {
          data: {
            table: {
              all: [{ id: 9869, played: 14, pts: 22 }],
              home: [{ id: 9869, played: 7, wins: 4, draws: 2, losses: 1, scoresStr: "9-4", pts: 14, idx: 4 }],
              away: [{ id: 9869, played: 7, wins: 2, draws: 2, losses: 3, scoresStr: "6-8", pts: 8, idx: 8 }],
            },
          },
        },
      ],
    };

    const stats = transformFotMobTeamStats(raw);
    assert.ok(stats);
    assert.equal(stats.goalsPerMatch, 1.4);
    assert.equal(stats.goalsPerMatchRank, 5);
    assert.equal(stats.expectedGoals, 18.2);
    assert.equal(stats.averagePossession, 52.8);
    assert.equal(stats.homeAttendance, 22100);
    assert.equal(stats.attendanceRank, 2);
    assert.equal(stats.matchesPlayed, 14);

    assert.equal(stats.homeSplit.wins, 4);
    assert.equal(stats.homeSplit.goalsFor, 9);
    assert.equal(stats.homeSplit.goalsAgainst, 4);
    assert.equal(stats.awaySplit.wins, 2);
  });

  it("falls back to computed home attendance when API omits home_attendance_team", () => {
    const raw = {
      stats: {
        teams: [
          {
            header: "Goals per match",
            participant: {
              value: 1.1,
              rank: 18,
              stat: { name: "goals_team_match", value: 1.1 },
            },
          },
        ],
      },
    };

    const stats = transformFotMobTeamStats(raw, [], undefined, 21184);
    assert.ok(stats);
    assert.equal(stats.homeAttendance, 21184);
    assert.equal(stats.attendanceRank, null);
  });

  it("returns null when teams stats are empty", () => {
    const stats = transformFotMobTeamStats({ stats: { teams: [] } });
    assert.equal(stats, null);
  });
});
