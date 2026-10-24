/**
 * Status of an individual letter guess in Wordle.
 * - 'correct': Correct letter in the exact correct position (Green).
 * - 'present': Letter is in the word, but in a different position (Yellow).
 * - 'absent': Letter is not in the word (or excess occurrence) (Gray).
 */
export type LetterEvaluation = 'correct' | 'present' | 'absent';

/**
 * Evaluated letter slot for a row.
 */
export interface EvaluatedLetter {
  char: string;
  status: LetterEvaluation;
}

/**
 * Daily Sportinguista Wordle challenge item.
 */
export interface WordleDailyWord {
  id: string; // ISO date 'YYYY-MM-DD'
  word: string; // Canonical target word (uppercase, unaccented)
  clue?: string; // Short cultural hint shown after completion or if requested
  trivia: string; // Historical/cultural context revealed upon game over
}

/**
 * Game status.
 */
export type WordleGameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

/**
 * Stored state for a single challenge (current or historical).
 */
export interface WordleChallengeState {
  date: string;
  word: string;
  guesses: string[];
  status: WordleGameStatus;
  completedAt?: string;
}

/**
 * Overall player statistics for Wordle.
 */
export interface WordleStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // { 1: 0, 2: 3, 3: 10, ... }
  lastPlayedDate?: string;
}
