import type { WhoAreYaPlayer, WhoAreYaKit } from './types';

export const WHO_ARE_YA_EPOCH_DATE = '2026-10-01';

/**
 * Computes the number of days elapsed between the epoch date and a given target date.
 */
export function getDaysSinceEpoch(dateStr: string): number {
  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = WHO_ARE_YA_EPOCH_DATE.split('-').map(Number);

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const epochUtc = Date.UTC(epochYear, epochMonth - 1, epochDay);

  const diffMs = targetUtc - epochUtc;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Multiplicative congruent permutation (PRNG) guaranteeing non-repetition
 * within a full round of length N.
 */
function getPermutedIndex(stepIndex: number, totalCount: number, roundNumber: number, salt = 151): number {
  if (totalCount <= 1) return 0;
  const primeStep = salt + (roundNumber * 17);
  return (stepIndex * primeStep + roundNumber * 37) % totalCount;
}

/**
 * Resolves deterministic daily player for an ISO date string (YYYY-MM-DD).
 */
export function getPlayerForDate(dateStr: string, catalog: WhoAreYaPlayer[]): WhoAreYaPlayer {
  const days = getDaysSinceEpoch(dateStr);
  const total = catalog.length;
  const round = Math.floor(days / total);
  const step = days % total;
  const idx = getPermutedIndex(step, total, round, 151);
  return catalog[idx] || catalog[0];
}

/**
 * Resolves deterministic daily kit for an ISO date string (YYYY-MM-DD).
 */
export function getKitForDate(dateStr: string, catalog: WhoAreYaKit[]): WhoAreYaKit {
  const days = getDaysSinceEpoch(dateStr);
  const total = catalog.length;
  const round = Math.floor(days / total);
  const step = days % total;
  const idx = getPermutedIndex(step, total, round, 199);
  return catalog[idx] || catalog[0];
}

/**
 * Returns today's ISO date string (YYYY-MM-DD).
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
