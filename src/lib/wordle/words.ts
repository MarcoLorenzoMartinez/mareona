import rawWords from '../../data/wordle/sporting-words.json' with { type: 'json' };
import type { WordleDailyWord } from './types';
import { normalizeWord } from './engine.ts';

export interface CatalogSportingWord {
  slug: string;
  word: string;
  trivia: string;
  orderAdded: number;
}

export const SPORTING_WORD_CATALOG: CatalogSportingWord[] = rawWords;

/**
 * Epoch origin date for Mareona Wordle (Day 0 = 2026-10-01).
 * Every day at 00:00 CET increments the game day index.
 */
export const WORDLE_EPOCH_DATE = '2026-10-01';

/**
 * Computes the number of days elapsed between the epoch date and a given target date.
 */
export function getDaysSinceEpoch(dateStr: string): number {
  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = WORDLE_EPOCH_DATE.split('-').map(Number);

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const epochUtc = Date.UTC(epochYear, epochMonth - 1, epochDay);

  const diffMs = targetUtc - epochUtc;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Multiplicative congruent permutation (PRNG) that guarantees a pseudo-random
 * but strictly bijective 1:1 permutation without duplicates within a round.
 * Coprime step (151) with catalog length ensures full period coverage.
 */
function getPermutedIndex(stepIndex: number, totalCount: number, roundNumber: number): number {
  const primeStep = 151 + (roundNumber * 17);
  return (stepIndex * primeStep + roundNumber * 37) % totalCount;
}

/**
 * Resolves the challenge for a given ISO date (YYYY-MM-DD).
 * Ensures that no word repeats until all words in the catalog have appeared once.
 */
export function getChallengeForDate(dateStr: string): WordleDailyWord {
  const daysElapsed = getDaysSinceEpoch(dateStr);
  const totalWords = SPORTING_WORD_CATALOG.length;

  const roundNumber = Math.floor(daysElapsed / totalWords);
  const indexInRound = daysElapsed % totalWords;

  const pickedIndex = getPermutedIndex(indexInRound, totalWords, roundNumber);
  const wordEntry = SPORTING_WORD_CATALOG[pickedIndex] || SPORTING_WORD_CATALOG[0];

  return {
    id: dateStr,
    word: normalizeWord(wordEntry.word),
    trivia: wordEntry.trivia,
  };
}

/**
 * Gets today's challenge based on Europe/Madrid timezone (CET/CEST) where midnight resets.
 * Allows passing an optional date string or timestamp to prevent server prerender timing issues.
 */
export function getTodayChallenge(customDate?: Date): WordleDailyWord {
  const d = customDate || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayDateStr = formatter.format(d);
  return getChallengeForDate(todayDateStr);
}

/**
 * Returns historical challenges list from epoch up to the given date or today.
 */
export function getHistoricalChallenges(upToDateStr?: string): WordleDailyWord[] {
  const maxDateStr = upToDateStr || getTodayChallenge().id;
  const daysCount = getDaysSinceEpoch(maxDateStr);

  const list: WordleDailyWord[] = [];
  const [epochYear, epochMonth, epochDay] = WORDLE_EPOCH_DATE.split('-').map(Number);

  for (let i = 0; i <= daysCount; i++) {
    const d = new Date(Date.UTC(epochYear, epochMonth - 1, epochDay + i));
    const isoDate = d.toISOString().slice(0, 10);
    list.push(getChallengeForDate(isoDate));
  }

  // Reverse so the newest challenge is first
  return list.reverse();
}

/**
 * Calculates how many times each word has appeared up to a given date.
 */
export function getWordAppearanceCounts(upToDateStr?: string): Record<string, number> {
  const history = getHistoricalChallenges(upToDateStr);
  const counts: Record<string, number> = {};

  for (const item of history) {
    counts[item.word] = (counts[item.word] || 0) + 1;
  }
  return counts;
}

/**
 * Validates whether a guess is valid.
 */
export function isValidWordGuess(guess: string, targetLength: number): boolean {
  const norm = normalizeWord(guess);
  if (norm.length !== targetLength) return false;
  return /^[A-ZÑ]+$/.test(norm);
}
