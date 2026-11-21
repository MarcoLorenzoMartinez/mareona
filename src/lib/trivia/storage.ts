import type { TriviaPlayerAttempt, TriviaStats } from './types.ts';
import { TRIVIA_EPOCH_DATE } from './engine.ts';

export const TRIVIA_STORAGE_PREFIX = 'mareona_trivia_';
export const TRIVIA_STATS_KEY = 'mareona_trivia_stats';
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const INITIAL_TRIVIA_STATS: TriviaStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
};

/**
 * Retrieves the stored trivia attempt for a given challenge date.
 */
export function getStoredTriviaAttempt(dateStr: string): TriviaPlayerAttempt | null {
  if (typeof window === 'undefined' || dateStr < TRIVIA_EPOCH_DATE) return null;
  try {
    const raw = localStorage.getItem(`${TRIVIA_STORAGE_PREFIX}${dateStr}`);
    if (!raw) return null;
    return JSON.parse(raw) as TriviaPlayerAttempt;
  } catch {
    return null;
  }
}

/**
 * Saves a player's trivia attempt for a specific date.
 */
export function saveTriviaAttempt(attempt: TriviaPlayerAttempt): void {
  if (typeof window === 'undefined' || attempt.dateStr < TRIVIA_EPOCH_DATE) return;
  try {
    localStorage.setItem(`${TRIVIA_STORAGE_PREFIX}${attempt.dateStr}`, JSON.stringify(attempt));
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mareona_local_account_mutated'));
    }
  } catch {
    // Fail silently in private browsing / full quota
  }
}

/**
 * Purges pre-epoch test attempts (< TRIVIA_EPOCH_DATE) and computes clean stats
 * strictly from valid finished daily trivia challenges.
 */
export function getStoredTriviaStats(): TriviaStats {
  if (typeof window === 'undefined') return INITIAL_TRIVIA_STATS;
  try {
    const validAttempts: TriviaPlayerAttempt[] = [];
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(TRIVIA_STORAGE_PREFIX) || key === TRIVIA_STATS_KEY) {
        continue;
      }
      const dateStr = key.slice(TRIVIA_STORAGE_PREFIX.length);
      if (!DATE_KEY_REGEX.test(dateStr)) continue;

      if (dateStr < TRIVIA_EPOCH_DATE) {
        keysToRemove.push(key);
        continue;
      }

      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as TriviaPlayerAttempt;
      if (parsed && typeof parsed.isCorrect === 'boolean') {
        validAttempts.push({ ...parsed, dateStr });
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    validAttempts.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    let played = 0;
    let won = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let lastPlayedDate: string | undefined;

    for (const attempt of validAttempts) {
      played += 1;
      lastPlayedDate = attempt.dateStr;
      if (attempt.isCorrect) {
        won += 1;
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const reconciled: TriviaStats = {
      played,
      won,
      currentStreak,
      maxStreak,
      lastPlayedDate,
    };

    localStorage.setItem(TRIVIA_STATS_KEY, JSON.stringify(reconciled));
    return reconciled;
  } catch {
    return INITIAL_TRIVIA_STATS;
  }
}

/**
 * Reconciles and persists trivia stats when a daily question is answered.
 */
export function updateTriviaStatsOnFinish(isCorrect: boolean, dateStr: string): TriviaStats {
  const current = getStoredTriviaStats();

  // If already counted today's stats, skip to avoid double counting
  if (dateStr < TRIVIA_EPOCH_DATE || current.lastPlayedDate === dateStr) {
    return current;
  }

  const played = current.played + 1;
  const won = isCorrect ? current.won + 1 : current.won;
  const currentStreak = isCorrect ? current.currentStreak + 1 : 0;
  const maxStreak = Math.max(current.maxStreak, currentStreak);

  const updated: TriviaStats = {
    played,
    won,
    currentStreak,
    maxStreak,
    lastPlayedDate: dateStr,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TRIVIA_STATS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return updated;
}
