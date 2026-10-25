/**
 * Supported Higher or Lower game modes for Real Sporting.
 * - 'matches': Comparison of all-time official matches played.
 * - 'goals': Comparison of all-time official goals scored.
 * - 'minutes': Comparison of total official minutes on the pitch.
 */
export type HigherLowerMode = 'matches' | 'goals' | 'minutes';

export interface HigherLowerPlayer {
  bdfId: number;
  name: string;
  fullName: string;
  position: string;
  photoUrl: string;
  totalPlayed: number;
  totalGoals: number;
  totalMinutes: number;
  startSeason: string;
  endSeason: string;
  startYear: number;
  endYear: number;
}

export type HigherLowerGuess = 'higher' | 'lower';

export interface HigherLowerEvaluation {
  isCorrect: boolean;
  leftValue: number;
  rightValue: number;
}

export interface HigherLowerStats {
  bestScoreByMode: Record<HigherLowerMode, number>;
  totalGamesPlayed: number;
}
