import type { PorraPrediction, PorraMatch, PorraEvaluation } from './types';

export const EXACT_SCORE_POINTS = 5;
export const OUTCOME_POINTS = 2;
export const SCORER_POINTS = 1;

/**
 * Evaluates points earned by a user prediction against real match results.
 * - Exact score match: 5 points
 * - 1X2 outcome match: 2 points
 * - Each correctly predicted Sporting goal scorer: +1 point per hit
 *
 * @param prediction User's submitted prediction
 * @param match Finished match data
 * @returns Breakdown of awarded points and hit indicators
 */
export function evaluatePorraPrediction(
  prediction: PorraPrediction,
  match: PorraMatch
): PorraEvaluation {
  if (match.actualHomeScore === undefined || match.actualAwayScore === undefined) {
    return {
      points: 0,
      exactScoreMatch: false,
      outcomeMatch: false,
      scorersMatchCount: 0,
    };
  }

  const exactScoreMatch =
    prediction.homeScore === match.actualHomeScore &&
    prediction.awayScore === match.actualAwayScore;

  const actualOutcome = Math.sign(match.actualHomeScore - match.actualAwayScore);
  const predictedOutcome = Math.sign(prediction.homeScore - prediction.awayScore);
  const outcomeMatch = actualOutcome === predictedOutcome;

  let scorersMatchCount = 0;
  if (match.actualSportingScorers && match.actualSportingScorers.length > 0) {
    const availableActual = [...match.actualSportingScorers.map((s) => s.toLowerCase().trim())];
    for (const predicted of prediction.sportingScorers) {
      const idx = availableActual.indexOf(predicted.toLowerCase().trim());
      if (idx !== -1) {
        scorersMatchCount++;
        availableActual.splice(idx, 1);
      }
    }
  }

  let points = 0;
  if (exactScoreMatch) {
    points += EXACT_SCORE_POINTS;
  } else if (outcomeMatch) {
    points += OUTCOME_POINTS;
  }

  points += scorersMatchCount * SCORER_POINTS;

  return {
    points,
    exactScoreMatch,
    outcomeMatch,
    scorersMatchCount,
  };
}
