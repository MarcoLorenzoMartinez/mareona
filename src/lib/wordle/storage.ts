import type { WordleChallengeState, WordleStats } from './types.ts';
import { WORDLE_EPOCH_DATE } from './words.ts';

export const STORAGE_KEY_PREFIX = 'mareona_wordle_v2_state_';
export const STATS_STORAGE_KEY = 'mareona_wordle_v2_stats';
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const INITIAL_WORDLE_STATS: WordleStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
};

/**
 * Retrieves the stored state for a given challenge date.
 */
export function getInitialWordleState(challengeId: string, targetWord: string): WordleChallengeState {
  if (typeof window === 'undefined' || challengeId < WORDLE_EPOCH_DATE) {
    return {
      date: challengeId,
      word: targetWord,
      guesses: [],
      status: 'IN_PROGRESS',
    };
  }
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${challengeId}`);
    if (saved) {
      const parsed: WordleChallengeState = JSON.parse(saved);
      const validGuesses = (parsed.guesses || []).filter(
        (g) => g && g.length === targetWord.length
      );
      return {
        date: challengeId,
        word: targetWord,
        guesses: validGuesses,
        status: parsed.status || 'IN_PROGRESS',
        completedAt: parsed.completedAt,
      };
    }
  } catch {
    // LocalStorage inaccessible
  }
  return {
    date: challengeId,
    word: targetWord,
    guesses: [],
    status: 'IN_PROGRESS',
  };
}

/**
 * Purges pre-epoch test entries (< WORDLE_EPOCH_DATE) and computes clean player stats
 * strictly from valid finished Wordle challenges in LocalStorage.
 */
export function getInitialWordleStats(): WordleStats {
  if (typeof window === 'undefined') return INITIAL_WORDLE_STATS;
  try {
    const validStates: { dateStr: string; state: WordleChallengeState }[] = [];
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_KEY_PREFIX)) continue;

      const dateStr = key.slice(STORAGE_KEY_PREFIX.length);
      if (!DATE_KEY_REGEX.test(dateStr)) continue;

      if (dateStr < WORDLE_EPOCH_DATE) {
        keysToRemove.push(key);
        continue;
      }

      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as WordleChallengeState;
      if (parsed && (parsed.status === 'WON' || parsed.status === 'LOST')) {
        validStates.push({ dateStr, state: parsed });
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    validStates.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    let played = 0;
    let won = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let lastPlayedDate: string | undefined;
    const guessDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

    for (const { dateStr, state } of validStates) {
      played += 1;
      lastPlayedDate = dateStr;
      if (state.status === 'WON') {
        won += 1;
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
        const attempts = state.guesses?.length || 1;
        guessDistribution[attempts] = (guessDistribution[attempts] || 0) + 1;
      } else {
        currentStreak = 0;
      }
    }

    const reconciled: WordleStats = {
      played,
      won,
      currentStreak,
      maxStreak,
      guessDistribution,
      lastPlayedDate,
    };

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(reconciled));
    return reconciled;
  } catch {
    return INITIAL_WORDLE_STATS;
  }
}

/**
 * Safely persists game state to LocalStorage.
 */
export function saveWordleState(newState: WordleChallengeState): void {
  if (newState.date < WORDLE_EPOCH_DATE) return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${newState.date}`, JSON.stringify(newState));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mareona_local_account_mutated'));
    }
  } catch {
    // Storage unavailable
  }
}

/**
 * Computes updated player stats when a challenge is solved or failed.
 */
export function computeUpdatedWordleStats(
  prev: WordleStats,
  won: boolean,
  attemptsCount: number,
  challengeDate: string
): WordleStats {
  const current = getInitialWordleStats();
  if (challengeDate < WORDLE_EPOCH_DATE || current.lastPlayedDate === challengeDate) {
    return current;
  }

  const played = current.played + 1;
  const wonCount = won ? current.won + 1 : current.won;
  const currentStreak = won ? current.currentStreak + 1 : 0;
  const maxStreak = Math.max(current.maxStreak, currentStreak);
  const guessDistribution = { ...current.guessDistribution };

  if (won) {
    guessDistribution[attemptsCount] = (guessDistribution[attemptsCount] || 0) + 1;
  }

  const nextStats: WordleStats = {
    played,
    won: wonCount,
    currentStreak,
    maxStreak,
    guessDistribution,
    lastPlayedDate: challengeDate,
  };

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats));
  } catch {
    // Storage unavailable
  }

  return nextStats;
}
