import type { TriviaPlayerAttempt, TriviaStats } from './types';

export const TRIVIA_STORAGE_PREFIX = 'mareona_trivia_';
export const TRIVIA_STATS_KEY = 'mareona_trivia_stats';

export const INITIAL_TRIVIA_STATS: TriviaStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
};

export function getStoredTriviaAttempt(dateStr: string): TriviaPlayerAttempt | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${TRIVIA_STORAGE_PREFIX}${dateStr}`);
    if (!raw) return null;
    return JSON.parse(raw) as TriviaPlayerAttempt;
  } catch {
    return null;
  }
}

export function saveTriviaAttempt(attempt: TriviaPlayerAttempt): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${TRIVIA_STORAGE_PREFIX}${attempt.dateStr}`, JSON.stringify(attempt));
  } catch {
    // Fail silently in private browsing / full quota
  }
}

export function getStoredTriviaStats(): TriviaStats {
  if (typeof window === 'undefined') return INITIAL_TRIVIA_STATS;
  try {
    const raw = localStorage.getItem(TRIVIA_STATS_KEY);
    if (!raw) return INITIAL_TRIVIA_STATS;
    return JSON.parse(raw) as TriviaStats;
  } catch {
    return INITIAL_TRIVIA_STATS;
  }
}

export function updateTriviaStatsOnFinish(isCorrect: boolean, dateStr: string): TriviaStats {
  const current = getStoredTriviaStats();

  // If already counted today's stats, skip to avoid double counting
  if (current.lastPlayedDate === dateStr) {
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
