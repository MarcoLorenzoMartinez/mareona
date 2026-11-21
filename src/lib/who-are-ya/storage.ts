import type { PlayerGuessResult } from './types.ts';
import { WHO_ARE_YA_EPOCH_DATE } from './daily.ts';

export interface WhoAreYaStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate?: string;
  guessDistribution?: Record<number, number>;
}

export const WHO_ARE_YA_STORAGE_PREFIX = 'mareona_who_are_ya_';
export const WHO_ARE_YA_STATS_KEY = 'mareona_who_are_ya_stats';
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_GUESSES = 6;

export const INITIAL_WHO_ARE_YA_STATS: WhoAreYaStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

/**
 * Retrieves stored player guesses for a specific challenge date.
 */
export function getStoredPlayerGuesses(dateStr: string): PlayerGuessResult[] {
  if (typeof window === 'undefined' || dateStr < WHO_ARE_YA_EPOCH_DATE) return [];
  try {
    const raw = localStorage.getItem(`${WHO_ARE_YA_STORAGE_PREFIX}${dateStr}`);
    if (!raw) return [];
    return JSON.parse(raw) as PlayerGuessResult[];
  } catch {
    return [];
  }
}

/**
 * Persists player guesses for a specific challenge date.
 */
export function savePlayerGuesses(dateStr: string, guesses: PlayerGuessResult[]): void {
  if (typeof window === 'undefined' || dateStr < WHO_ARE_YA_EPOCH_DATE) return;
  try {
    localStorage.setItem(`${WHO_ARE_YA_STORAGE_PREFIX}${dateStr}`, JSON.stringify(guesses));
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mareona_local_account_mutated'));
    }
  } catch {
    // Fail silently in private browsing / full quota
  }
}

/**
 * Purges pre-epoch test entries (< WHO_ARE_YA_EPOCH_DATE) and computes clean stats
 * strictly from valid finished daily challenges.
 */
export function getStoredWhoAreYaStats(): WhoAreYaStats {
  if (typeof window === 'undefined') return INITIAL_WHO_ARE_YA_STATS;
  try {
    const validEntries: { dateStr: string; guesses: PlayerGuessResult[] }[] = [];
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(WHO_ARE_YA_STORAGE_PREFIX) || key === WHO_ARE_YA_STATS_KEY) {
        continue;
      }
      const dateStr = key.slice(WHO_ARE_YA_STORAGE_PREFIX.length);
      if (!DATE_KEY_REGEX.test(dateStr)) continue;

      if (dateStr < WHO_ARE_YA_EPOCH_DATE) {
        keysToRemove.push(key);
        continue;
      }

      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as PlayerGuessResult[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        validEntries.push({ dateStr, guesses: parsed });
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    validEntries.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    let played = 0;
    let won = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let lastPlayedDate: string | undefined;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    for (const { dateStr, guesses } of validEntries) {
      const isWon = guesses.some((g) => g.isCorrect);
      const isFinished = isWon || guesses.length >= MAX_GUESSES;
      if (!isFinished) continue;

      played += 1;
      lastPlayedDate = dateStr;
      if (isWon) {
        won += 1;
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
        const attempts = Math.min(Math.max(guesses.length, 1), MAX_GUESSES);
        distribution[attempts] = (distribution[attempts] || 0) + 1;
      } else {
        currentStreak = 0;
      }
    }

    const reconciled: WhoAreYaStats = {
      played,
      won,
      currentStreak,
      maxStreak,
      lastPlayedDate,
      guessDistribution: distribution,
    };

    localStorage.setItem(WHO_ARE_YA_STATS_KEY, JSON.stringify(reconciled));
    return reconciled;
  } catch {
    return INITIAL_WHO_ARE_YA_STATS;
  }
}

/**
 * Reconciles and persists stats when a daily game finishes.
 */
export function updateWhoAreYaStatsOnFinish(
  isWon: boolean,
  attemptsCount: number,
  dateStr: string
): WhoAreYaStats {
  const current = getStoredWhoAreYaStats();
  if (dateStr < WHO_ARE_YA_EPOCH_DATE || current.lastPlayedDate === dateStr) {
    return current;
  }

  const played = current.played + 1;
  const won = current.won + (isWon ? 1 : 0);
  const currentStreak = isWon ? current.currentStreak + 1 : 0;
  const maxStreak = Math.max(current.maxStreak, currentStreak);

  const distribution = {
    ...INITIAL_WHO_ARE_YA_STATS.guessDistribution,
    ...(current.guessDistribution || {}),
  };

  if (isWon && attemptsCount >= 1 && attemptsCount <= MAX_GUESSES) {
    distribution[attemptsCount] = (distribution[attemptsCount] || 0) + 1;
  }

  const updated: WhoAreYaStats = {
    played,
    won,
    currentStreak,
    maxStreak,
    lastPlayedDate: dateStr,
    guessDistribution: distribution,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WHO_ARE_YA_STATS_KEY, JSON.stringify(updated));
    } catch {
      // quota exception fallback
    }
  }

  return updated;
}
