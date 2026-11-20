import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { submitPorraPredictionSchema } from '../../src/lib/porra/schemas.ts';

describe('Porra Validation Schemas Suite', () => {
  it('accepts valid scorelines and Sporting scorers', () => {
    const res = submitPorraPredictionSchema.safeParse({
      matchId: '401800123',
      homeScore: 2,
      awayScore: 1,
      sportingScorers: ['Gaspar Campos', 'Juan Otero'],
    });
    assert.strictEqual(res.success, true);
  });

  it('accepts 0-0 draw with empty scorers array', () => {
    const res = submitPorraPredictionSchema.safeParse({
      matchId: '401800123',
      homeScore: 0,
      awayScore: 0,
      sportingScorers: [],
    });
    assert.strictEqual(res.success, true);
  });

  it('rejects empty matchId, negative scores, decimals, and out-of-range goals (> 9)', () => {
    assert.strictEqual(
      submitPorraPredictionSchema.safeParse({
        matchId: '   ',
        homeScore: 1,
        awayScore: 0,
        sportingScorers: [],
      }).success,
      false
    );

    assert.strictEqual(
      submitPorraPredictionSchema.safeParse({
        matchId: '401800123',
        homeScore: -1,
        awayScore: 0,
        sportingScorers: [],
      }).success,
      false
    );

    assert.strictEqual(
      submitPorraPredictionSchema.safeParse({
        matchId: '401800123',
        homeScore: 1.5,
        awayScore: 0,
        sportingScorers: [],
      }).success,
      false
    );

    assert.strictEqual(
      submitPorraPredictionSchema.safeParse({
        matchId: '401800123',
        homeScore: 10,
        awayScore: 0,
        sportingScorers: [],
      }).success,
      false
    );
  });

  it('rejects more than 9 scorers in a single prediction', () => {
    const res = submitPorraPredictionSchema.safeParse({
      matchId: '401800123',
      homeScore: 9,
      awayScore: 0,
      sportingScorers: Array.from({ length: 10 }, (_, i) => `Jugador ${i + 1}`),
    });
    assert.strictEqual(res.success, false);
  });
});
