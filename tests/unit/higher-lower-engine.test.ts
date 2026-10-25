import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEligiblePlayers,
  getMetricValue,
  formatMetricValue,
  evaluateHigherLower,
  pickRandomPlayer,
} from '../../src/lib/higher-lower/engine.ts';
import type { HigherLowerPlayer } from '../../src/lib/higher-lower/types.ts';

const MOCK_JOAQUIN: HigherLowerPlayer = {
  bdfId: 1284,
  name: 'Joaquín',
  fullName: 'Joaquín Alonso González',
  position: 'Centrocampista',
  photoUrl: 'https://www.bdfutbol.com/i/j/1284i.jpg',
  totalPlayed: 646,
  totalGoals: 80,
  totalMinutes: 55906,
  startSeason: '1976/77',
  endSeason: '1991/92',
  startYear: 1976,
  endYear: 1992,
};

const MOCK_QUINI: HigherLowerPlayer = {
  bdfId: 3268,
  name: 'Quini',
  fullName: 'Enrique de Castro González',
  position: 'Delantero',
  photoUrl: 'https://www.bdfutbol.com/i/j/3268f.jpg',
  totalPlayed: 521,
  totalGoals: 272,
  totalMinutes: 43117,
  startSeason: '1968/69',
  endSeason: '1986/87',
  startYear: 1968,
  endYear: 1987,
};

describe('Higher or Lower Engine Suite', () => {
  it('filters eligible pools correctly for each supported mode', () => {
    const goalsPool = getEligiblePlayers('goals');
    assert.ok(goalsPool.length > 100);
    assert.ok(goalsPool.every((p) => p.totalGoals >= 5));

    const matchesPool = getEligiblePlayers('matches');
    assert.ok(matchesPool.length > 300);
    assert.ok(matchesPool.every((p) => p.totalPlayed >= 20));

    const minutesPool = getEligiblePlayers('minutes');
    assert.ok(minutesPool.length > 200);
    assert.ok(minutesPool.every((p) => p.totalMinutes >= 1500));
  });

  it('retrieves the proper numerical metric per mode', () => {
    assert.equal(getMetricValue(MOCK_QUINI, 'goals'), 272);
    assert.equal(getMetricValue(MOCK_QUINI, 'matches'), 521);
    assert.equal(getMetricValue(MOCK_QUINI, 'minutes'), 43117);
  });

  it('formats metric values in Spanish correctly', () => {
    assert.equal(formatMetricValue(272, 'goals'), '272 goles');
    assert.equal(formatMetricValue(1, 'goals'), '1 gol');
    assert.equal(formatMetricValue(646, 'matches'), '646 partidos');
    assert.equal(formatMetricValue(4000, 'minutes'), '4.000 min');
    assert.equal(formatMetricValue(55906, 'minutes'), '55.906 min');
  });

  it('evaluates higher or lower correctly', () => {
    // Quini has 272 goals, Joaquín has 80.
    // If Left = Joaquín (80) and Right = Quini (272), guess 'higher' is correct
    const evalHigher = evaluateHigherLower(MOCK_JOAQUIN, MOCK_QUINI, 'goals', 'higher');
    assert.equal(evalHigher.isCorrect, true);
    assert.equal(evalHigher.leftValue, 80);
    assert.equal(evalHigher.rightValue, 272);

    const evalLower = evaluateHigherLower(MOCK_JOAQUIN, MOCK_QUINI, 'goals', 'lower');
    assert.equal(evalLower.isCorrect, false);

    // Matches: Left = Joaquín (646), Right = Quini (521)
    // Quini has fewer matches -> guess 'lower' is correct
    const evalMatchesLower = evaluateHigherLower(MOCK_JOAQUIN, MOCK_QUINI, 'matches', 'lower');
    assert.equal(evalMatchesLower.isCorrect, true);

    // Equality ties are counted as correct
    const evalTie = evaluateHigherLower(MOCK_QUINI, MOCK_QUINI, 'goals', 'higher');
    assert.equal(evalTie.isCorrect, true);
  });

  it('picks random player excluding designated IDs', () => {
    const pool = [MOCK_JOAQUIN, MOCK_QUINI];
    const picked = pickRandomPlayer(pool, [MOCK_JOAQUIN.bdfId]);
    assert.equal(picked.bdfId, MOCK_QUINI.bdfId);
  });
});
