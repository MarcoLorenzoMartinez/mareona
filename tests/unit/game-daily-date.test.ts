import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatGameDailyDate } from '../../src/lib/games/daily-date.ts';

describe('formatGameDailyDate', () => {
  it('formats valid ISO date into short spanish date with year', () => {
    const formatted = formatGameDailyDate('2026-11-05');
    assert.match(formatted, /5.*nov.*2026/i);
  });

  it('handles invalid or empty date gracefully', () => {
    assert.equal(formatGameDailyDate(''), '');
    assert.equal(formatGameDailyDate('invalid-date'), '');
  });
});
