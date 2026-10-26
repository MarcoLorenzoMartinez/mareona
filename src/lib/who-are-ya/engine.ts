import type {
  WhoAreYaPlayer,
  PlayerGuessResult,
  StatComparison,
} from './types';

export const MAX_ATTEMPTS = 6;

/**
 * Calculates current pixelation downscale factor based on attempts and game outcome.
 * High factor (e.g. 24) = giant pixel blocks.
 * Factor 1 = crisp natural original resolution.
 *
 * @param attemptCount Number of guesses already made
 * @param isGameOver Whether the game has completed
 * @returns Downscale integer factor
 */
export function getPixelationFactor(attemptCount: number, isGameOver: boolean): number {
  if (isGameOver) return 1;
  const pixelFactors = [24, 18, 12, 8, 5, 3];
  const level = Math.min(attemptCount, pixelFactors.length - 1);
  return pixelFactors[level];
}

/**
 * Calculates current blur in pixels based on failed attempts and game outcome.
 *
 * @param attemptCount Number of guesses already made
 * @param isGameOver Whether the game has completed
 * @returns CSS blur string (e.g. '18px')
 */
export function getBlurAmount(attemptCount: number, isGameOver: boolean): string {
  if (isGameOver) return '0px';
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
