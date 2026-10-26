import type { WordleChallengeState, WordleStats } from './types';

export const STORAGE_KEY_PREFIX = 'mareona_wordle_v2_state_';
export const STATS_STORAGE_KEY = 'mareona_wordle_v2_stats';

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
  if (typeof window === 'undefined') {
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
 * Retrieves player stats from LocalStorage.
 */
export function getInitialWordleStats(): WordleStats {
  if (typeof window === 'undefined') return INITIAL_WORDLE_STATS;
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // LocalStorage inaccessible
  }
  return INITIAL_WORDLE_STATS;
}

/**
 * Safely persists game state to LocalStorage.
 */
export function saveWordleState(newState: WordleChallengeState): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${newState.date}`, JSON.stringify(newState));
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
  const played = prev.played + 1;
  const wonCount = won ? prev.won + 1 : prev.won;
  const currentStreak = won ? prev.currentStreak + 1 : 0;
  const maxStreak = Math.max(prev.maxStreak, currentStreak);
  const guessDistribution = { ...prev.guessDistribution };

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
