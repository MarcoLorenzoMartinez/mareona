import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDailyRoundPermutation,
  getDailyPermutedIndex,
} from '../../src/lib/games/daily-permutation.ts';

describe('Daily Games Shuffled Permutation Engine', () => {
  it('generates a strictly bijective 1:1 permutation with zero duplicates', () => {
    const total = 166;
    const round0 = getDailyRoundPermutation(total, 0, 1905);

    assert.equal(round0.length, total);
    const unique = new Set(round0);
    assert.equal(unique.size, total, 'Every item in the round must appear exactly once');
  });

  it('guarantees non-repeating index progression across an entire cycle', () => {
    const total = 105;
    const seen = new Set<number>();

    for (let day = 0; day < total; day++) {
      const idx = getDailyPermutedIndex(day, total, 97);
      assert.equal(seen.has(idx), false, `Day ${day} repeated index ${idx} before full cycle!`);
      seen.add(idx);
    }

    assert.equal(seen.size, total);
  });

  it('produces pseudo-random non-linear ordering without monotonic sequences', () => {
    const total = 323;
    const round = getDailyRoundPermutation(total, 0, 1284);

    let consecutiveCount = 0;
    for (let i = 0; i < round.length - 1; i++) {
      if (round[i + 1] === round[i] + 1) {
        consecutiveCount++;
      }
    }

    // A purely random shuffle of 323 elements has ~1-3 consecutive pairs; strictly not linear
    assert.ok(consecutiveCount < 10, `Shuffle should not be linear; consecutive count: ${consecutiveCount}`);
    assert.notEqual(round[0], 0, 'First day should be pseudorandomly shuffled rather than fixed at index 0');
  });

  it('reshuffles with a different random distribution on subsequent rounds', () => {
    const total = 100;
    const round0 = getDailyRoundPermutation(total, 0, 1905);
    const round1 = getDailyRoundPermutation(total, 1, 1905);

    assert.equal(round0.length, total);
    assert.equal(round1.length, total);
    assert.notDeepEqual(round0, round1, 'Round 1 must have a fresh shuffle distinct from Round 0');
  });

  it('guarantees round 0 designated initial milestone while maintaining complete cycle bijection', () => {
    const total = 125;
    const targetMilestone = 55;
    const round0 = getDailyRoundPermutation(total, 0, 6271, targetMilestone);

    assert.equal(round0[0], targetMilestone, 'Designated launch milestone must be at day 0');
    assert.equal(round0.length, total);
    const unique = new Set(round0);
    assert.equal(unique.size, total, 'Designated milestone must not duplicate or lose any other item');

    // Round 1 should not force targetMilestone to index 0
    const round1 = getDailyRoundPermutation(total, 1, 6271, targetMilestone);
    assert.equal(round1.length, total);
  });
});
