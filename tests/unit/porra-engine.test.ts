import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePorraPrediction,
  getPorraRewardTier,
  resolveUnclaimedPorraRewards,
} from '../../src/lib/porra/engine.ts';
import {
  buildUserLeaderboardEntry,
  filterAndRankLeaderboard,
} from '../../src/lib/porra/leaderboard.ts';
import type {
  PorraPrediction,
  PorraMatch,
  PorraLeaderboardEntry,
} from '../../src/lib/porra/types.ts';

describe('Porra Engine Suite', () => {
  const dummyMatch: PorraMatch = {
    id: 'match-101',
    roundName: 'Jornada 12',
    matchday: 12,
    homeTeam: { name: 'Real Sporting', isSporting: true },
    awayTeam: { name: 'Real Zaragoza', isSporting: false },
    kickoffAt: '2026-11-01T18:30:00Z',
    isFinished: true,
    actualHomeScore: 2,
    actualAwayScore: 1,
    actualSportingScorers: ['Gaspar Campos', 'Juan Otero'],
  };

  it('awards 5 points for exact score without scorers match', () => {
    const pred: PorraPrediction = {
      matchId: 'match-101',
      homeScore: 2,
      awayScore: 1,
      sportingScorers: ['Campuzano', 'Cote'],
      submittedAt: '2026-10-31T12:00:00Z',
    };
    const evalRes = evaluatePorraPrediction(pred, dummyMatch);
    assert.equal(evalRes.exactScoreMatch, true);
    assert.equal(evalRes.outcomeMatch, true);
    assert.equal(evalRes.scorersMatchCount, 0);
    assert.equal(evalRes.points, 5);
  });

  it('awards 5 points + scorers points for exact score and correct scorers', () => {
    const pred: PorraPrediction = {
      matchId: 'match-101',
      homeScore: 2,
      awayScore: 1,
      sportingScorers: ['Gaspar Campos', 'Juan Otero'],
      submittedAt: '2026-10-31T12:00:00Z',
    };
    const evalRes = evaluatePorraPrediction(pred, dummyMatch);
    assert.equal(evalRes.exactScoreMatch, true);
    assert.equal(evalRes.scorersMatchCount, 2);
    assert.equal(evalRes.points, 7); // 5 + 2*1
  });

  it('awards 2 points for outcome match (1X2) when score differs', () => {
    const pred: PorraPrediction = {
      matchId: 'match-101',
      homeScore: 1,
      awayScore: 0,
      sportingScorers: ['Gaspar Campos'],
      submittedAt: '2026-10-31T12:00:00Z',
    };
    const evalRes = evaluatePorraPrediction(pred, dummyMatch);
    assert.equal(evalRes.exactScoreMatch, false);
    assert.equal(evalRes.outcomeMatch, true);
    assert.equal(evalRes.scorersMatchCount, 1);
    assert.equal(evalRes.points, 3); // 2 outcome + 1 scorer
  });

  it('awards 0 score points when outcome differs, but still counts any scorer hit', () => {
    const pred: PorraPrediction = {
      matchId: 'match-101',
      homeScore: 1,
      awayScore: 2,
      sportingScorers: ['Gaspar Campos'],
      submittedAt: '2026-10-31T12:00:00Z',
    };
    const evalRes = evaluatePorraPrediction(pred, dummyMatch);
    assert.equal(evalRes.exactScoreMatch, false);
    assert.equal(evalRes.outcomeMatch, false);
    assert.equal(evalRes.scorersMatchCount, 1);
    assert.equal(evalRes.points, 1);
    assert.equal(evalRes.rewardTier, 'aficionado');
  });

  it('maps points to exact booster pack reward tiers (0=null, 1-2=aficionado, 3-4=rojiblanco, >=5=leyenda)', () => {
    assert.equal(getPorraRewardTier(0), null);
    assert.equal(getPorraRewardTier(1), 'aficionado');
    assert.equal(getPorraRewardTier(2), 'aficionado');
    assert.equal(getPorraRewardTier(3), 'rojiblanco');
    assert.equal(getPorraRewardTier(4), 'rojiblanco');
    assert.equal(getPorraRewardTier(5), 'leyenda');
    assert.equal(getPorraRewardTier(7), 'leyenda');
  });

  it('accumulates unclaimed rewards across multiple finished matches and skips claimed or 0-point matches', () => {
    const matches: PorraMatch[] = [
      {
        ...dummyMatch,
        id: 'm1',
        roundName: 'Jornada 10',
        kickoffAt: '2026-10-15T18:00:00Z',
        actualHomeScore: 1,
        actualAwayScore: 0,
        actualSportingScorers: ['Gaspar Campos'],
      },
      {
        ...dummyMatch,
        id: 'm2',
        roundName: 'Jornada 11',
        kickoffAt: '2026-10-22T18:00:00Z',
        actualHomeScore: 0,
        actualAwayScore: 2,
        actualSportingScorers: [],
      },
      {
        ...dummyMatch,
        id: 'm3',
        roundName: 'Jornada 12',
        kickoffAt: '2026-11-01T18:00:00Z',
        actualHomeScore: 2,
        actualAwayScore: 1,
        actualSportingScorers: ['Gaspar Campos', 'Juan Otero'],
      },
      {
        ...dummyMatch,
        id: 'm4',
        roundName: 'Jornada 13',
        kickoffAt: '2026-11-08T18:00:00Z',
        actualHomeScore: 3,
        actualAwayScore: 0,
        actualSportingScorers: ['Juan Otero'],
      },
    ];

    const predictions: Record<string, PorraPrediction> = {
      // m1: exact score (5 pts) -> leyenda
      m1: { matchId: 'm1', homeScore: 1, awayScore: 0, sportingScorers: [], submittedAt: '2026-10-14T10:00:00Z' },
      // m2: missed everything (0 pts) -> no reward
      m2: { matchId: 'm2', homeScore: 2, awayScore: 0, sportingScorers: ['Gaspar Campos'], submittedAt: '2026-10-21T10:00:00Z' },
      // m3: outcome + 1 scorer (3 pts) -> rojiblanco
      m3: { matchId: 'm3', homeScore: 1, awayScore: 0, sportingScorers: ['Gaspar Campos'], submittedAt: '2026-10-31T10:00:00Z' },
      // m4: outcome only (2 pts), but already claimed -> skipped
      m4: { matchId: 'm4', homeScore: 1, awayScore: 0, sportingScorers: [], submittedAt: '2026-11-07T10:00:00Z' },
    };

    const claimed = new Set<string>(['m4']);
    const pending = resolveUnclaimedPorraRewards(matches, predictions, claimed);

    assert.equal(pending.length, 2);
    // Sorted from most recent (m3) to oldest (m1)
    assert.equal(pending[0]?.match.id, 'm3');
    assert.equal(pending[0]?.rewardTier, 'rojiblanco');
    assert.equal(pending[0]?.evaluation.points, 3);

    assert.equal(pending[1]?.match.id, 'm1');
    assert.equal(pending[1]?.rewardTier, 'leyenda');
    assert.equal(pending[1]?.evaluation.points, 5);
  });

  it('computes user leaderboard entry including lastMatchPoints and currentPrediction', () => {
    const matches: PorraMatch[] = [
      {
        ...dummyMatch,
        id: 'm1',
        kickoffAt: '2026-10-15T18:00:00Z',
        actualHomeScore: 1,
        actualAwayScore: 0,
        actualSportingScorers: ['Gaspar Campos'],
      },
      {
        ...dummyMatch,
        id: 'm2',
        kickoffAt: '2026-11-01T18:00:00Z',
        actualHomeScore: 2,
        actualAwayScore: 1,
        actualSportingScorers: ['Gaspar Campos', 'Juan Otero'],
      },
    ];

    const predictions: Record<string, PorraPrediction> = {
      m1: {
        matchId: 'm1',
        homeScore: 1,
        awayScore: 0,
        sportingScorers: [],
        submittedAt: '2026-10-14T10:00:00Z',
      }, // 5 pts (exact)
      m2: {
        matchId: 'm2',
        homeScore: 1,
        awayScore: 0,
        sportingScorers: ['Gaspar Campos'],
        submittedAt: '2026-10-31T10:00:00Z',
      }, // 3 pts (outcome + 1 scorer)
    };

    const currentPred: PorraPrediction = {
      matchId: 'm3',
      homeScore: 2,
      awayScore: 0,
      sportingScorers: ['Juan Otero'],
      submittedAt: '2026-11-14T10:00:00Z',
    };

    const entry = buildUserLeaderboardEntry({
      userId: 'user-1',
      userName: 'Marco',
      finishedMatches: matches,
      predictionsByMatchId: predictions,
      currentPrediction: currentPred,
    });

    assert.ok(entry);
    assert.equal(entry.totalPoints, 8);
    assert.equal(entry.exactScoresCount, 1);
    assert.equal(entry.outcomesCount, 2);
    assert.equal(entry.lastMatchPoints, 3);
    assert.deepEqual(entry.currentPrediction, {
      homeScore: 2,
      awayScore: 0,
      sportingScorers: ['Juan Otero'],
    });
  });

  it('filters and re-ranks leaderboard entries between all and friends tabs', () => {
    const rawEntries: PorraLeaderboardEntry[] = [
      {
        rank: 0,
        userId: 'u1',
        userName: 'Líder Global',
        avatarSeed: 'u1',
        totalPoints: 25,
        exactScoresCount: 4,
        outcomesCount: 6,
        isFriend: false,
      },
      {
        rank: 0,
        userId: 'u2',
        userName: 'Pelayo',
        avatarSeed: 'u2',
        totalPoints: 18,
        exactScoresCount: 2,
        outcomesCount: 5,
        isFriend: true,
      },
      {
        rank: 0,
        userId: 'u3',
        userName: 'Marco',
        avatarSeed: 'u3',
        totalPoints: 12,
        exactScoresCount: 1,
        outcomesCount: 4,
        isCurrentUser: true,
      },
    ];

    const allRanked = filterAndRankLeaderboard(rawEntries, 'all');
    assert.equal(allRanked.length, 3);
    assert.equal(allRanked[0]?.userName, 'Líder Global');
    assert.equal(allRanked[0]?.rank, 1);
    assert.equal(allRanked[2]?.userName, 'Marco');
    assert.equal(allRanked[2]?.rank, 3);

    const friendsRanked = filterAndRankLeaderboard(rawEntries, 'friends');
    assert.equal(friendsRanked.length, 2);
    assert.equal(friendsRanked[0]?.userName, 'Pelayo');
    assert.equal(friendsRanked[0]?.rank, 1);
    assert.equal(friendsRanked[1]?.userName, 'Marco');
    assert.equal(friendsRanked[1]?.rank, 2);
  });
});
