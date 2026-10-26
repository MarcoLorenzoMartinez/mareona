import type { HigherLowerMode, HigherLowerStats } from './types';

export const HIGHER_LOWER_STATS_KEY = 'mareona_higher_lower_stats_v1';

export const INITIAL_HIGHER_LOWER_STATS: HigherLowerStats = {
  bestScoreByMode: { matches: 0, goals: 0, minutes: 0 },
  totalGamesPlayed: 0,
};

/**
 * Safely loads Higher or Lower player statistics from LocalStorage.
 */
export function getStoredHigherLowerStats(): HigherLowerStats {
  if (typeof window === 'undefined') return INITIAL_HIGHER_LOWER_STATS;
  try {
    const saved = localStorage.getItem(HIGHER_LOWER_STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // LocalStorage inaccessible
  }
  return INITIAL_HIGHER_LOWER_STATS;
}

/**
 * Safely persists Higher or Lower player statistics to LocalStorage.
 */
export function saveHigherLowerStats(stats: HigherLowerStats): void {
  try {
    localStorage.setItem(HIGHER_LOWER_STATS_KEY, JSON.stringify(stats));
  } catch {
    // LocalStorage fallback
  }
}

/**
 * Returns updated stats when recording a new score for a game mode.
 */
export function recordScoreInStats(
  prev: HigherLowerStats,
  mode: HigherLowerMode,
  score: number
): HigherLowerStats {
  const nextBest = Math.max(prev.bestScoreByMode[mode] || 0, score);
  return {
    ...prev,
    bestScoreByMode: {
      ...prev.bestScoreByMode,
      [mode]: nextBest,
    },
  };
}

/**
 * Increments the total games played count in stats.
 */
export function incrementGamesPlayed(prev: HigherLowerStats): HigherLowerStats {
  return {
    ...prev,
    totalGamesPlayed: prev.totalGamesPlayed + 1,
  };
}
