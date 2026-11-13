import type { TriviaQuestion, TriviaDailyChallenge } from './types';
import rawQuestions from '../../data/trivia/questions.json' with { type: 'json' };
import { ALL_CLUB_FIGURES } from './club-figures.ts';
import { normalizeSearchText } from '../utils/search-utils.ts';
import { getDailyPermutedIndex } from '../games/daily-permutation.ts';

export const TRIVIA_QUESTIONS: TriviaQuestion[] = rawQuestions as TriviaQuestion[];

/**
 * Epoch origin date for Mareona Trivia (Day 0 = 2026-11-13).
 * Increments each day at 00:00 CET.
 */
export const TRIVIA_EPOCH_DATE = '2026-11-13';

/**
 * Normalizes text for clean matching: removes accents, lowercase, collapses spaces.
 */
export function normalizeTriviaText(input: string): string {
  return normalizeSearchText(input)
    .replace(/[^\w\s\-\/\:\.]/g, '') // strip special punctuation
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Calculates days elapsed between the epoch date and target ISO date.
 */
export function getTriviaDaysSinceEpoch(dateStr: string): number {
  if (dateStr < TRIVIA_EPOCH_DATE) return 0;

  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = TRIVIA_EPOCH_DATE.split('-').map(Number);

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const epochUtc = Date.UTC(epochYear, epochMonth - 1, epochDay);

  const diffMs = targetUtc - epochUtc;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Returns the question challenge corresponding to a given ISO date (YYYY-MM-DD)
 * using a Fisher-Yates shuffled permutation per round.
 */
export function getTriviaForDate(dateStr: string): TriviaDailyChallenge {
  const daysElapsed = getTriviaDaysSinceEpoch(dateStr);
  const total = TRIVIA_QUESTIONS.length;

  const permutedIndex = getDailyPermutedIndex(daysElapsed, total, 6271, 55);
  const question = TRIVIA_QUESTIONS[permutedIndex] ?? TRIVIA_QUESTIONS[0];

  return {
    dayIndex: daysElapsed + 1,
    dateStr,
    question,
    totalQuestions: total,
  };
}

/**
 * Returns today's ISO date string (YYYY-MM-DD).
 * During server-side rendering or static generation, returns the deterministic epoch date.
 */
export function getTriviaTodayDateStr(): string {
  if (typeof window === 'undefined') {
    return TRIVIA_EPOCH_DATE;
  }
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return todayStr < TRIVIA_EPOCH_DATE ? TRIVIA_EPOCH_DATE : todayStr;
}

/**
 * Evaluates whether a player's answer matches the question's accepted answers.
 * If question is of type 'player', checks direct accepted answers, canonical display match,
 * and matches between the figure's nickname/short name, full legal name, and catalog records.
 */
export function evaluateTriviaAnswer(userAnswer: string, question: TriviaQuestion): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;

  const normalizedUser = normalizeTriviaText(userAnswer);

  // 1. Direct match with accepted answers
  const isDirectMatch = question.acceptedAnswers.some((accepted) => {
    const normalizedAccepted = normalizeTriviaText(accepted);
    return normalizedUser === normalizedAccepted;
  });

  if (isDirectMatch) return true;

  // 2. Direct match with canonical answer
  if (normalizedUser === normalizeTriviaText(question.canonicalAnswer)) {
    return true;
  }

  // 3. If question is 'player', resolve nickname vs full legal name across catalog figures
  if (question.type === 'player') {
    const matchingCatalogFigure = ALL_CLUB_FIGURES.find(
      (p) =>
        normalizeTriviaText(p.displayName) === normalizedUser ||
        normalizeTriviaText(p.fullName) === normalizedUser ||
        normalizeTriviaText(p.name) === normalizedUser
    );

    if (matchingCatalogFigure) {
      const normDisplay = normalizeTriviaText(matchingCatalogFigure.displayName);
      const normShort = normalizeTriviaText(matchingCatalogFigure.name);
      const normFull = normalizeTriviaText(matchingCatalogFigure.fullName);
      const normCanonical = normalizeTriviaText(question.canonicalAnswer);

      return (
        normDisplay === normCanonical ||
        normShort === normCanonical ||
        normFull === normCanonical ||
        normFull.includes(normCanonical) ||
        normCanonical.includes(normShort) ||
        question.acceptedAnswers.some((accepted) => {
          const normAcc = normalizeTriviaText(accepted);
          return (
            normAcc === normDisplay ||
            normAcc === normShort ||
            normAcc === normFull ||
            normFull.includes(normAcc) ||
            normShort.includes(normAcc)
          );
        })
      );
    }
  }

  return false;
}
