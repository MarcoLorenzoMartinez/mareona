import type { PlayerGuessResult } from './types';

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

export const INITIAL_WHO_ARE_YA_STATS: WhoAreYaStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

export function getStoredPlayerGuesses(dateStr: string): PlayerGuessResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${WHO_ARE_YA_STORAGE_PREFIX}${dateStr}`);
    if (!raw) return [];
    return JSON.parse(raw) as PlayerGuessResult[];
  } catch {
    return [];
  }
}

export function savePlayerGuesses(dateStr: string, guesses: PlayerGuessResult[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${WHO_ARE_YA_STORAGE_PREFIX}${dateStr}`, JSON.stringify(guesses));
  } catch {
    // Fail silently in private browsing / full quota
  }
}

export function getStoredWhoAreYaStats(): WhoAreYaStats {
  if (typeof window === 'undefined') return INITIAL_WHO_ARE_YA_STATS;
  try {
    const raw = localStorage.getItem(WHO_ARE_YA_STATS_KEY);
    if (!raw) return INITIAL_WHO_ARE_YA_STATS;
    return JSON.parse(raw) as WhoAreYaStats;
  } catch {
    return INITIAL_WHO_ARE_YA_STATS;
  }
}

export function updateWhoAreYaStatsOnFinish(
  isWon: boolean,
  attemptsCount: number,
  dateStr: string
): WhoAreYaStats {
  const current = getStoredWhoAreYaStats();

  if (current.lastPlayedDate === dateStr) {
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

  if (isWon && attemptsCount >= 1 && attemptsCount <= 6) {
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
