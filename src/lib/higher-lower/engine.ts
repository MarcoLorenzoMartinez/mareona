import rawPlayers from '../../data/historical/club-all-time-players.json' with { type: 'json' };
import type {
  HigherLowerEvaluation,
  HigherLowerGuess,
  HigherLowerMode,
  HigherLowerPlayer,
} from './types';

export const ALL_PLAYERS: HigherLowerPlayer[] = rawPlayers as HigherLowerPlayer[];

/**
 * Returns an eligible, filtered pool of players for a specific game mode.
 * - 'matches': Minimum 20 matches played to ensure recognizable figures.
 * - 'goals': Minimum 5 goals scored to make offensive comparisons meaningful.
 * - 'minutes': Minimum 1,500 minutes played.
 */
export function getEligiblePlayers(mode: HigherLowerMode): HigherLowerPlayer[] {
  switch (mode) {
    case 'goals':
      return ALL_PLAYERS.filter((p) => p.totalGoals >= 5);
    case 'minutes':
      return ALL_PLAYERS.filter((p) => p.totalMinutes >= 1500);
    case 'matches':
    default:
      return ALL_PLAYERS.filter((p) => p.totalPlayed >= 20);
  }
}

/**
 * Extracts the numerical metric for a player depending on the active game mode.
 */
export function getMetricValue(player: HigherLowerPlayer, mode: HigherLowerMode): number {
  switch (mode) {
    case 'goals':
      return player.totalGoals;
    case 'minutes':
      return player.totalMinutes;
    case 'matches':
    default:
      return player.totalPlayed;
  }
}

const spanishNumberFormatter = new Intl.NumberFormat('es-ES', {
  useGrouping: true,
});

/**
 * Formats a metric with its appropriate label.
 * Always formats with thousand grouping separators (e.g. 4.000 min, 55.906 min).
 */
export function formatMetricValue(value: number, mode: HigherLowerMode): string {
  const formattedNumber = spanishNumberFormatter.format(value);
  switch (mode) {
    case 'goals':
      return `${formattedNumber} ${value === 1 ? 'gol' : 'goles'}`;
    case 'minutes':
      return `${formattedNumber} min`;
    case 'matches':
    default:
      return `${formattedNumber} ${value === 1 ? 'partido' : 'partidos'}`;
  }
}

/**
 * Randomly picks a distinct player from the eligible pool that is not in the excluded list.
 */
export function pickRandomPlayer(
  pool: HigherLowerPlayer[],
  excludedBdfIds: number[] = []
): HigherLowerPlayer {
  const available = pool.filter((p) => !excludedBdfIds.includes(p.bdfId));
  const source = available.length > 0 ? available : pool;
  const randomIndex = Math.floor(Math.random() * source.length);
  return source[randomIndex];
}

/**
 * Evaluates whether the user's guess (Higher or Lower) is correct.
 * When values are equal (tie), the guess is always treated as correct.
 */
export function evaluateHigherLower(
  leftPlayer: HigherLowerPlayer,
  rightPlayer: HigherLowerPlayer,
  mode: HigherLowerMode,
  guess: HigherLowerGuess
): HigherLowerEvaluation {
  const leftValue = getMetricValue(leftPlayer, mode);
  const rightValue = getMetricValue(rightPlayer, mode);

  let isCorrect = false;
  if (rightValue === leftValue) {
    isCorrect = true;
  } else if (guess === 'higher') {
    isCorrect = rightValue > leftValue;
  } else {
    isCorrect = rightValue < leftValue;
  }

  return {
    isCorrect,
    leftValue,
    rightValue,
  };
}
