import rawWords from '../../data/wordle/sporting-words.json' with { type: 'json' };
import rawValidDict from '../../data/wordle/valid-dictionary.json' with { type: 'json' };
import type { WordleDailyWord } from './types';
import { normalizeWord } from './engine.ts';
import { getDailyPermutedIndex } from '../games/daily-permutation.ts';

const VALID_DICTIONARY: Record<string, string> = rawValidDict;

export interface CatalogSportingWord {
  slug: string;
  word: string;
  trivia: string;
  orderAdded: number;
}

export const SPORTING_WORD_CATALOG: CatalogSportingWord[] = rawWords;

const SPORTING_WORDS_SET = new Set(
  SPORTING_WORD_CATALOG.map((item) => normalizeWord(item.word))
);

/**
 * Epoch origin date for Mareona Wordle (Day 0 = 2026-11-13).
 * Every day at 00:00 CET increments the game day index.
 */
export const WORDLE_EPOCH_DATE = '2026-11-13';

/**
 * Computes the number of days elapsed between the epoch date and a given target date.
 */
export function getDaysSinceEpoch(dateStr: string): number {
  if (dateStr < WORDLE_EPOCH_DATE) return 0;

  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = WORDLE_EPOCH_DATE.split('-').map(Number);

  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const epochUtc = Date.UTC(epochYear, epochMonth - 1, epochDay);

  const diffMs = targetUtc - epochUtc;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Resolves the challenge for a given ISO date (YYYY-MM-DD).
 * Ensures that no word repeats until all words in the catalog have appeared once,
 * using a deterministic pseudorandom Fisher-Yates shuffle per round.
 */
export function getChallengeForDate(dateStr: string): WordleDailyWord {
  const daysElapsed = getDaysSinceEpoch(dateStr);
  const totalWords = SPORTING_WORD_CATALOG.length;

  const pickedIndex = getDailyPermutedIndex(daysElapsed, totalWords, 8431, 0);
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
  if (typeof window === 'undefined' && !customDate) {
    return getChallengeForDate(WORDLE_EPOCH_DATE);
  }
  const d = customDate || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayDateStr = formatter.format(d);
  const effectiveDate = todayDateStr < WORDLE_EPOCH_DATE ? WORDLE_EPOCH_DATE : todayDateStr;
  return getChallengeForDate(effectiveDate);
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
 * Binary search over the sorted lexicon string for O(log N) lookup time.
 */
function binarySearchDict(dictStr: string, word: string, len: number): boolean {
  let low = 0;
  let high = dictStr.length / len - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const midWord = dictStr.substring(mid * len, (mid + 1) * len);

    if (midWord === word) return true;
    if (midWord < word) low = mid + 1;
    else high = mid - 1;
  }
  return false;
}

/**
 * Validates whether a guess is a real valid Spanish word or valid Sporting de Gijón term.
 * Checks both the Sporting catalog and the Spanish dictionary (supporting the letter Ñ).
 */
export function isValidWordGuess(guess: string, targetLength: number): boolean {
  const norm = normalizeWord(guess);
  if (norm.length !== targetLength) return false;
  if (!/^[A-ZÑ]+$/.test(norm)) return false;

  // Sporting catalog words (e.g. MARIÑO, QUINI, MOLINON, ROJIBLANCO) are always valid
  if (SPORTING_WORDS_SET.has(norm)) return true;

  const dictStr = VALID_DICTIONARY[String(targetLength)];
  if (!dictStr) {
    // Fallback: If no dictionary exists for this custom length, allow valid alphabetical
    return true;
  }

  if (binarySearchDict(dictStr, norm, targetLength)) return true;

  // Dictionary is ASCII normalized (Ñ mapped to N); check Ñ-replaced variant
  if (norm.includes('Ñ')) {
    return binarySearchDict(dictStr, norm.replace(/Ñ/g, 'N'), targetLength);
  }

  return false;
}
