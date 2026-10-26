import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePlayerGuess,
  evaluateKitGuess,
  getBlurAmount,
  getPixelationFactor,
  getDailyIndex,
} from '../../src/lib/who-are-ya/engine.ts';
import type { WhoAreYaPlayer, WhoAreYaKit } from '../../src/lib/who-are-ya/types.ts';

describe('Who Are Ya Engine Suite', () => {
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

  const dummyKitTarget: WhoAreYaKit = {
    id: '1978-79-1',
    label: '1978/79 — 1ª Camiseta',
    season: '1978/79',
    type: '1ª',
    year: 1978,
    details: 'Mítica camiseta roja y blanca',
    image: '/images/kits/1978-79-1.svg',
  };

  const dummyKitGuess: WhoAreYaKit = {
    id: '2014-15-1',
    label: '2014/15 — 1ª Camiseta',
    season: '2014/15',
    type: '1ª',
    year: 2014,
    details: 'Kappa de los guajes',
    image: '/images/kits/2014-15-1.svg',
  };

  it('evaluates player guess correctly with arrows and matches', () => {
    const res = evaluatePlayerGuess(dummyPlayerGuess, dummyPlayerTarget);
    assert.equal(res.isCorrect, false);
    assert.equal(res.nationalityMatch, true);
    assert.equal(res.positionMatch, false);
    // Joaquín (646) vs Quini (521) -> guess is higher, target is lower
    assert.equal(res.matchesPlayed.comparison, 'lower');
    // Joaquín goals (80) vs Quini (272) -> guess is lower, target is higher
    assert.equal(res.goals.comparison, 'higher');
    // Joaquín startYear (1976) vs Quini (1968) -> guess higher, target lower
    assert.equal(res.startYear.comparison, 'lower');
  });

  it('evaluates exact player guess match', () => {
    const res = evaluatePlayerGuess(dummyPlayerTarget, dummyPlayerTarget);
    assert.equal(res.isCorrect, true);
    assert.equal(res.nationalityMatch, true);
    assert.equal(res.positionMatch, true);
    assert.equal(res.matchesPlayed.comparison, 'equal');
    assert.equal(res.goals.comparison, 'equal');
    assert.equal(res.startYear.comparison, 'equal');
    assert.equal(res.endYear.comparison, 'equal');
  });

  it('evaluates kit guess comparisons', () => {
    const res = evaluateKitGuess(dummyKitGuess, dummyKitTarget);
    assert.equal(res.isCorrect, false);
    assert.equal(res.typeMatch, true);
    assert.equal(res.seasonMatch, false);
    assert.equal(res.yearComparison, 'lower');
  });

  it('computes blur and pixelation scales', () => {
    assert.equal(getBlurAmount(0, false), '22px');
    assert.equal(getBlurAmount(1, false), '17px');
    assert.equal(getBlurAmount(5, false), '3px');
    assert.equal(getBlurAmount(2, true), '0px');

    assert.equal(getPixelationFactor(0, false), 24);
    assert.equal(getPixelationFactor(1, false), 18);
    assert.equal(getPixelationFactor(5, false), 3);
    assert.equal(getPixelationFactor(3, true), 1);
  });

  it('computes daily index bounded by length', () => {
    const idx = getDailyIndex(20, 0);
    assert.ok(idx >= 0 && idx < 20);
  });
});
