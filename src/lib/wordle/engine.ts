import type { EvaluatedLetter } from './types';

/**
 * Normalizes input words by stripping accents, trim spaces, and uppercasing.
 * Preserves 'Ñ' as a distinct Spanish letter.
 *
 * @param text - Raw input string
 * @returns Cleaned uppercase string without diacritics (except Ñ)
 */
export function normalizeWord(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toUpperCase()
    // Separate diacritics but preserve Ñ
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ü/g, 'U');
}

/**
 * Evaluates a guess against a target word following standard Wordle rules:
 * 1. Letters in the exact same position are 'correct' (green).
 * 2. Excess letters or non-existent letters are 'absent' (gray).
 * 3. Matched elsewhere without exceeding available frequency are 'present' (yellow).
 *
 * @param guess - User's normalized guess
 * @param target - The daily secret normalized word
 * @returns Array of EvaluatedLetter for each position
 * @throws Error if length doesn't match
 */
export function evaluateGuess(guess: string, target: string): EvaluatedLetter[] {
  const normGuess = normalizeWord(guess);
  const normTarget = normalizeWord(target);

  if (normGuess.length !== normTarget.length) {
    // If length doesn't match (e.g. stale state from different word length), return absent letters safely
    return normGuess.split('').map((char) => ({ char, status: 'absent' }));
  }

  const length = normGuess.length;
  const result: EvaluatedLetter[] = new Array(length);
  const targetLetterCounts: Record<string, number> = {};

  // First pass: identify exact matches ('correct') and count remaining target letters
  for (let i = 0; i < length; i++) {
    const tChar = normTarget[i];
    const gChar = normGuess[i];

    if (gChar === tChar) {
      result[i] = { char: gChar, status: 'correct' };
    } else {
      targetLetterCounts[tChar] = (targetLetterCounts[tChar] || 0) + 1;
    }
  }

  // Second pass: identify 'present' (yellow) vs 'absent' (gray)
  for (let i = 0; i < length; i++) {
    if (result[i]) continue; // Already marked 'correct'

    const gChar = normGuess[i];
    const available = targetLetterCounts[gChar] || 0;

    if (available > 0) {
      result[i] = { char: gChar, status: 'present' };
      targetLetterCounts[gChar] = available - 1;
    } else {
      result[i] = { char: gChar, status: 'absent' };
    }
  }

  return result;
}

/**
 * Computes max allowed attempts based on word length.
 * 4-6 letters = 6 attempts; 7-8 letters = 7 attempts.
 */
export function getMaxAttemptsForLength(length: number): number {
  return length >= 7 ? 7 : 6;
}
