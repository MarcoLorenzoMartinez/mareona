import type {
  WhoAreYaPlayer,
  WhoAreYaKit,
  PlayerGuessResult,
  KitGuessResult,
  StatComparison,
} from './types';

export const MAX_ATTEMPTS = 6;

/**
 * Calculates current blur in pixels based on failed attempts and game outcome.
 *
 * @param attemptCount Number of guesses already made
 * @param isGameOver Whether the game has completed
 * @returns CSS blur string (e.g. '18px')
 */
export function getBlurAmount(attemptCount: number, isGameOver: boolean): string {
  if (isGameOver) return '0px';
  // Blur scale from initial 22px down to 3px on last attempt
  const blurLevels = [22, 17, 13, 9, 6, 3];
  const level = Math.min(attemptCount, blurLevels.length - 1);
  return `${blurLevels[level]}px`;
}

function compareNumbers(guess: number, target: number): StatComparison {
  if (guess === target) return 'equal';
  return guess < target ? 'higher' : 'lower';
}

/**
 * Compares guessed player with the target mystery player.
 */
export function evaluatePlayerGuess(
  guessed: WhoAreYaPlayer,
  target: WhoAreYaPlayer
): PlayerGuessResult {
  const isCorrect = guessed.bdfId === target.bdfId;

  return {
    player: guessed,
    isCorrect,
    nationalityMatch: guessed.nationality.toLowerCase() === target.nationality.toLowerCase(),
    positionMatch: guessed.position.toLowerCase() === target.position.toLowerCase(),
    matchesPlayed: {
      value: guessed.totalPlayed,
      comparison: compareNumbers(guessed.totalPlayed, target.totalPlayed),
    },
    goals: {
      value: guessed.totalGoals,
      comparison: compareNumbers(guessed.totalGoals, target.totalGoals),
    },
    startYear: {
      value: guessed.startYear,
      comparison: compareNumbers(guessed.startYear, target.startYear),
    },
    endYear: {
      value: guessed.endYear,
      comparison: compareNumbers(guessed.endYear, target.endYear),
    },
  };
}

/**
 * Compares guessed kit with target mystery kit.
 */
export function evaluateKitGuess(
  guessed: WhoAreYaKit,
  target: WhoAreYaKit
): KitGuessResult {
  const isCorrect = guessed.id === target.id;

  return {
    kit: guessed,
    isCorrect,
    seasonMatch: guessed.season === target.season,
    typeMatch: guessed.type === target.type,
    yearComparison: compareNumbers(guessed.year, target.year),
  };
}

/**
 * Deterministically picks the daily index from today's date.
 */
export function getDailyIndex(totalItems: number, offset = 0): number {
  if (totalItems <= 0) return 0;
  const now = new Date();
  const dateNum = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + offset;
  return Math.abs(dateNum % totalItems);
}
