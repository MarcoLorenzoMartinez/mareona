import type { PorraPrediction, PorraMatch, PorraEvaluation } from './types';

export const EXACT_SCORE_POINTS = 5;
export const OUTCOME_POINTS = 2;
export const SCORER_POINTS = 1;

/**
 * Window before kickoff after which prediction submissions are strictly forbidden.
 * 60,000 milliseconds = 1 minute.
 */
export const PORRA_CUTOFF_MS = 60 * 1000;

/**
 * Validates whether a user can still submit or modify their prediction for a match.
 * Submissions strictly close 1 minute before kickoff, or immediately if the match
 * has started ('live') or already concluded ('finished').
 *
 * @param kickoffAt ISO string or date representation of the match kickoff.
 * @param status Optional match status ('scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled').
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns True if predictions are open, false if closed.
 */
export function isPorraSubmissionOpen(
  kickoffAt: string,
  status?: string | null,
  now: number = Date.now()
): boolean {
  if (status === 'live' || status === 'finished' || status === 'cancelled' || status === 'postponed') {
    return false;
  }

  const kickoffTime = new Date(kickoffAt).getTime();
  if (Number.isNaN(kickoffTime)) {
    return false;
  }

  return now < kickoffTime - PORRA_CUTOFF_MS;
}

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
