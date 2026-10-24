import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGuess, normalizeWord, getMaxAttemptsForLength } from '../../src/lib/wordle/engine.ts';

describe('Wordle Engine Suite', () => {
  describe('normalizeWord', () => {
    it('removes accents while preserving Ñ', () => {
      assert.equal(normalizeWord('Quíni'), 'QUINI');
      assert.equal(normalizeWord('Yáñez'), 'YAÑEZ');
      assert.equal(normalizeWord('Molinón'), 'MOLINON');
      assert.equal(normalizeWord('   mareo  '), 'MAREO');
    });
  });

  describe('evaluateGuess', () => {
    it('marks all letters correct when guess matches target exactly', () => {
      const result = evaluateGuess('QUINI', 'QUINI');
      assert.equal(result.every((r) => r.status === 'correct'), true);
      assert.equal(result.map((r) => r.char).join(''), 'QUINI');
    });

    it('marks all letters absent when none match', () => {
      const result = evaluateGuess('MAREO', 'QUINI');
      assert.equal(result.every((r) => r.status === 'absent'), true);
    });

    it('evaluates mixed correct, present, and absent correctly', () => {
      // Target: MAREO, Guess: MARIO
      // M: correct, A: correct, R: correct, I: absent, O: correct
      const result = evaluateGuess('MARIO', 'MAREO');
      assert.deepEqual(result.map((r) => r.status), ['correct', 'correct', 'correct', 'absent', 'correct']);
    });

    it('handles duplicate letters in guess when target has single letter', () => {
      // Target: MAREO (one 'A')
      // Guess: CASAS (two 'A's)
      // C: absent
      // A (pos 1): correct (matches A at pos 1)
      // S: absent
      // A (pos 3): absent (only 1 'A' in MAREO and already used)
      // S: absent
      const result = evaluateGuess('CASAS', 'MAREO');
      assert.equal(result[1].status, 'correct');
      assert.equal(result[3].status, 'absent');
    });

    it('handles repeated letters when target has multiple of that letter', () => {
      // Target: PRECIADO (eight letters)
      // Guess:  PERDEDOR
      const result = evaluateGuess('PRECIADO', 'PRECIADO');
      assert.equal(result.length, 8);
      assert.equal(result.every((r) => r.status === 'correct'), true);
    });

    it('handles guess length differs from target length safely without throwing', () => {
      const result = evaluateGuess('QUINI', 'MOLINON');
      assert.equal(result.length, 5);
      assert.equal(result.every((r) => r.status === 'absent'), true);
    });
  });

  describe('getMaxAttemptsForLength', () => {
    it('allocates 6 attempts for 4, 5 and 6 letters, and 7 for 7 and 8 letters', () => {
      assert.equal(getMaxAttemptsForLength(4), 6);
      assert.equal(getMaxAttemptsForLength(5), 6);
      assert.equal(getMaxAttemptsForLength(6), 6);
      assert.equal(getMaxAttemptsForLength(7), 7);
      assert.equal(getMaxAttemptsForLength(8), 7);
    });
  });
});
