import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePlayerGuess,
  getBlurAmount,
  getPixelationFactor,
} from '../../src/lib/who-are-ya/engine.ts';
import {
  getPlayerForDate,
  getDaysSinceEpoch,
  WHO_ARE_YA_EPOCH_DATE,
} from '../../src/lib/who-are-ya/daily.ts';
import type { WhoAreYaPlayer } from '../../src/lib/who-are-ya/types.ts';

describe('Who Are Ya (¿Quién es?) Engine Suite', () => {
  const dummyPlayerTarget: WhoAreYaPlayer = {
    bdfId: 3268,
    name: 'Quini',
    fullName: 'Enrique de Castro González',
    position: 'Delantero',
    nationality: 'España',
    startYear: 1968,
    endYear: 1987,
    totalPlayed: 521,
    totalGoals: 272,
    photoUrl: 'https://www.bdfutbol.com/i/j/3268f.jpg',
  };

  const dummyPlayerGuess: WhoAreYaPlayer = {
    bdfId: 1284,
    name: 'Joaquín',
    fullName: 'Joaquín Alonso González',
    position: 'Centrocampista',
    nationality: 'España',
    startYear: 1976,
    endYear: 1992,
    totalPlayed: 646,
    totalGoals: 80,
    photoUrl: 'https://www.bdfutbol.com/i/j/1284i.jpg',
  };

  it('evaluates player guess correctly with arrows and matches', () => {
    const res = evaluatePlayerGuess(dummyPlayerGuess, dummyPlayerTarget);
    assert.equal(res.isCorrect, false);
    assert.equal(res.nationalityMatch, true);
    assert.equal(res.positionMatch, false);
    assert.equal(res.matchesPlayed.comparison, 'lower');
    assert.equal(res.goals.comparison, 'higher');
    assert.equal(res.startYear.comparison, 'lower');
  });

  it('evaluates exact player guess match', () => {
    const res = evaluatePlayerGuess(dummyPlayerTarget, dummyPlayerTarget);
    assert.equal(res.isCorrect, true);
    assert.equal(res.nationalityMatch, true);
    assert.equal(res.positionMatch, true);
    assert.equal(res.matchesPlayed.comparison, 'equal');
  });

  it('computes blur and pixelation scales', () => {
    assert.equal(getBlurAmount(0, false), '22px');
    assert.equal(getPixelationFactor(0, false), 24);
    assert.equal(getPixelationFactor(3, true), 1);
  });

  it('guarantees deterministic non-repeating daily challenge resolution', () => {
    const catalog = [dummyPlayerTarget, dummyPlayerGuess];
    const p1 = getPlayerForDate('2026-11-13', catalog);
    const p2 = getPlayerForDate('2026-11-14', catalog);
    assert.notEqual(p1.bdfId, p2.bdfId);

    const days = getDaysSinceEpoch(WHO_ARE_YA_EPOCH_DATE);
    assert.equal(days, 0);
  });
});
