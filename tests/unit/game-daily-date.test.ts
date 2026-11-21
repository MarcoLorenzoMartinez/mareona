import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGameDailyDate,
  getTodayMadridIsoDate,
  resolveClampedMadridDate,
} from '../../src/lib/games/daily-date.ts';

describe('formatGameDailyDate', () => {
  it('formats valid ISO date into short spanish date with year', () => {
    const formatted = formatGameDailyDate('2026-11-05');
    assert.match(formatted, /5.*nov.*2026/i);
  });

  it('handles invalid or empty date gracefully', () => {
    assert.equal(formatGameDailyDate(''), '');
    assert.equal(formatGameDailyDate('invalid-date'), '');
  });

  it('resolves Europe/Madrid calendar date across UTC midnight boundaries and clamps to epoch', () => {
    // 23:30 UTC on 2026-11-20 is already 00:30 CET on 2026-11-21 in Madrid
    const utcLateNight = new Date('2026-11-20T23:30:00Z');
    assert.equal(getTodayMadridIsoDate(utcLateNight), '2026-11-21');
    assert.equal(resolveClampedMadridDate('2026-11-13', utcLateNight), '2026-11-21');
    assert.equal(resolveClampedMadridDate('2026-12-01', utcLateNight), '2026-12-01');
  });
});
