import type { TriviaQuestion, TriviaDailyChallenge } from './types';
import rawQuestions from '../../data/trivia/questions.json' with { type: 'json' };

export const TRIVIA_QUESTIONS: TriviaQuestion[] = rawQuestions as TriviaQuestion[];

/**
 * Epoch origin date for Mareona Trivia (Day 0 = 2026-10-01).
 * Increments each day at 00:00 CET.
 */
export const TRIVIA_EPOCH_DATE = '2026-10-01';

/**
 * Normalizes text for clean matching: removes accents, lowercase, collapses spaces.
 */
export function normalizeTriviaText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s\-\/\:\.]/g, '') // strip special punctuation
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Calculates days elapsed between the epoch date and target ISO date.
 */
export function getTriviaDaysSinceEpoch(dateStr: string): number {
  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = TRIVIA_EPOCH_DATE.split('-').map(Number);

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const epochUtc = Date.UTC(epochYear, epochMonth - 1, epochDay);

  const diffMs = targetUtc - epochUtc;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Multiplicative congruent permutation (PRNG) guaranteeing a bijective 1:1 permutation.
 * No question repeats until all questions in the catalogue have been used once.
 */
function getPermutedQuestionIndex(stepIndex: number, totalCount: number, roundNumber: number): number {
  const primeStep = 97 + (roundNumber * 13);
  return (stepIndex * primeStep + roundNumber * 29) % totalCount;
}

/**
 * Returns the question challenge corresponding to a given ISO date (YYYY-MM-DD).
 */
export function getTriviaForDate(dateStr: string): TriviaDailyChallenge {
  const daysElapsed = getTriviaDaysSinceEpoch(dateStr);
  const total = TRIVIA_QUESTIONS.length;
  const roundNumber = Math.floor(daysElapsed / total);
  const stepIndex = daysElapsed % total;

  const permutedIndex = getPermutedQuestionIndex(stepIndex, total, roundNumber);
  const question = TRIVIA_QUESTIONS[permutedIndex] ?? TRIVIA_QUESTIONS[0];

  return {
    dayIndex: daysElapsed + 1,
    dateStr,
    question,
    totalQuestions: total,
  };
}

/**
 * Evaluates whether a player's answer matches the question's accepted answers.
 */
export function evaluateTriviaAnswer(userAnswer: string, question: TriviaQuestion): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;

  const normalizedUser = normalizeTriviaText(userAnswer);

  // Exact or accepted match
  return question.acceptedAnswers.some((accepted) => {
    const normalizedAccepted = normalizeTriviaText(accepted);
    return normalizedUser === normalizedAccepted;
  });
}
