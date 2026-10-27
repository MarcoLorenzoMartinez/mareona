import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePorraPrediction } from '../../src/lib/porra/engine.ts';
import type { PorraPrediction, PorraMatch } from '../../src/lib/porra/types.ts';

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
  });
});
