import rawValidDict from '../../data/wordle/valid-dictionary.json' with { type: 'json' };
import { normalizeWord } from './engine.ts';
import { isSportingWord, binarySearchDict } from './words.ts';

const VALID_DICTIONARY: Record<string, string> = rawValidDict;

/**
 * Returns the raw packed dictionary string for a given word length, or `null` if unavailable.
 */
export function getDictionaryForLength(length: number): string | null {
  return VALID_DICTIONARY[String(length)] ?? null;
}

/**
 * Validates whether a guess is a real valid Spanish word or valid Sporting de Gijón term.
 * Checks both the Sporting catalog and the Spanish dictionary (supporting the letter Ñ).
 */
export function isValidWordGuess(guess: string, targetLength: number): boolean {
  const norm = normalizeWord(guess);
  if (norm.length !== targetLength) return false;
  if (!/^[A-ZÑ]+$/.test(norm)) return false;

  if (isSportingWord(norm)) return true;

  const dictStr = VALID_DICTIONARY[String(targetLength)];
  if (!dictStr) return true;

  if (binarySearchDict(dictStr, norm, targetLength)) return true;

  if (norm.includes('Ñ')) {
    return binarySearchDict(dictStr, norm.replace(/Ñ/g, 'N'), targetLength);
  }

  return false;
}
