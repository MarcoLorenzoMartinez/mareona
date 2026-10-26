import { evaluateGuess } from './engine';

/**
 * Computes the aggregated keyboard letter evaluation statuses (correct, present, absent).
 */
export function getKeyboardLetterStatuses(
  guesses: string[],
  targetWord: string
): Record<string, 'correct' | 'present' | 'absent'> {
  const statuses: Record<string, 'correct' | 'present' | 'absent'> = {};
  for (const guess of guesses) {
    const evaluation = evaluateGuess(guess, targetWord);
    for (const item of evaluation) {
      const prev = statuses[item.char];
      if (item.status === 'correct') {
        statuses[item.char] = 'correct';
      } else if (item.status === 'present' && prev !== 'correct') {
        statuses[item.char] = 'present';
      } else if (!prev) {
        statuses[item.char] = 'absent';
      }
    }
  }
  return statuses;
}

/**
 * Purges all Wordle localStorage entries and resets game state.
 */
export function clearAllWordleStorage(
  storageKeyPrefix: string,
  statsStorageKey: string
): void {
  try {
    localStorage.removeItem(statsStorageKey);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(storageKeyPrefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // storage unavailable
  }
}

