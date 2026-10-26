// Domain types for "La pregunta del día" (Daily Trivia)
export type TriviaAnswerType = 'player' | 'season' | 'number' | 'score' | 'text';

export interface TriviaQuestion {
  /** Unique sequential identifier */
  id: string;
  /** Natural question in Spanish */
  question: string;
  /** Input mechanism type */
  type: TriviaAnswerType;
  /** Canonical display answer for post-game resolution */
  canonicalAnswer: string;
  /** Valid accepted forms for automatic matching (lowercased, normalized) */
  acceptedAnswers: string[];
  /** Detailed historical context shown after answering */
  explanation: string;
  /** Optional hint or helper format (e.g. "Temporada (ej. 1978/79)") */
  formatHint?: string;
  /** Numeric units when type is 'number' (e.g. 'goles', 'puntos', 'partidos') */
  unit?: string;
  /** Minimum and maximum bounds if applicable */
  min?: number;
  max?: number;
}

export interface TriviaDailyChallenge {
  dayIndex: number;
  dateStr: string;
  question: TriviaQuestion;
  totalQuestions: number;
}

export interface TriviaPlayerAttempt {
  dateStr: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface TriviaStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate?: string;
}
