import type { WhoAreYaPlayer } from './types';
import { getDailyPermutedIndex } from '../games/daily-permutation.ts';
import { resolveClampedMadridDate } from '../games/daily-date.ts';

export const WHO_ARE_YA_EPOCH_DATE = '2026-11-13';

/**
 * Computes the number of days elapsed between the epoch date and a given target date.
 */
export function getDaysSinceEpoch(dateStr: string): number {
  if (dateStr < WHO_ARE_YA_EPOCH_DATE) return 0;

  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = WHO_ARE_YA_EPOCH_DATE.split('-').map(Number);

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const epochUtc = Date.UTC(epochYear, epochMonth - 1, epochDay);

  const diffMs = targetUtc - epochUtc;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Resolves deterministic daily player for an ISO date string (YYYY-MM-DD)
 * using a Fisher-Yates shuffled permutation per round.
 */
export function getPlayerForDate(dateStr: string, catalog: WhoAreYaPlayer[]): WhoAreYaPlayer {
  const days = getDaysSinceEpoch(dateStr);
  const total = catalog.length;
  const idx = getDailyPermutedIndex(days, total, 4817, 2);
  return catalog[idx] || catalog[0];
}

/**
 * Returns today's ISO date string (YYYY-MM-DD) in Europe/Madrid timezone.
 * Clamps to WHO_ARE_YA_EPOCH_DATE if current date is prior to launch.
 */
export function getTodayDateStr(): string {
  if (typeof window === 'undefined') {
    return WHO_ARE_YA_EPOCH_DATE;
  }
  return resolveClampedMadridDate(WHO_ARE_YA_EPOCH_DATE);
}
