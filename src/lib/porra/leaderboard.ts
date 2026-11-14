import { evaluatePorraPrediction } from './engine.ts';
import type {
  PorraLeaderboardEntry,
  PorraMatch,
  PorraPrediction,
} from './types.ts';

export type PorraLeaderboardFilter = 'all' | 'friends';

export interface BuildUserEntryInput {
  readonly userId?: string;
  readonly userName: string;
  readonly finishedMatches: readonly PorraMatch[];
  readonly predictionsByMatchId: Readonly<Record<string, PorraPrediction>>;
  readonly currentPrediction: PorraPrediction | null;
}

/**
 * Computes the cumulative season leaderboard entry for a user based on finished matches
 * and their current matchday prediction.
 *
 * @param input - User identity, completed season matches, and stored predictions.
 * @returns Computed PorraLeaderboardEntry with season totals, last match points, and current pick.
 */
export function buildUserLeaderboardEntry(
  input: BuildUserEntryInput
): PorraLeaderboardEntry | null {
  const {
    userId,
    userName,
    finishedMatches,
    predictionsByMatchId,
    currentPrediction,
  } = input;

  const hasAnyFinishedPrediction = finishedMatches.some(
    (m) => Boolean(predictionsByMatchId[m.id])
  );

  if (!hasAnyFinishedPrediction && !currentPrediction) {
    return null;
  }

  let totalPoints = 0;
  let exactScoresCount = 0;
  let outcomesCount = 0;

  const sortedFinished = [...finishedMatches]
    .filter(
      (m) =>
        m.isFinished &&
        m.actualHomeScore !== undefined &&
        m.actualAwayScore !== undefined
    )
    .sort(
      (a, b) =>
        new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime()
    );

  let lastMatchPoints: number | undefined;

  for (let i = 0; i < sortedFinished.length; i++) {
    const match = sortedFinished[i]!;
    const pred = predictionsByMatchId[match.id];
    if (!pred) continue;

    const evaluation = evaluatePorraPrediction(pred, match);
    totalPoints += evaluation.points;
    if (evaluation.exactScoreMatch) {
      exactScoresCount += 1;
    }
    if (evaluation.outcomeMatch) {
      outcomesCount += 1;
    }
    if (i === 0) {
      lastMatchPoints = evaluation.points;
    }
  }

  return {
    rank: 1,
    userId,
    userName,
    avatarSeed: userName,
    totalPoints,
    exactScoresCount,
    outcomesCount,
    lastMatchPoints,
    currentPrediction: currentPrediction
      ? {
          homeScore: currentPrediction.homeScore,
          awayScore: currentPrediction.awayScore,
          sportingScorers: currentPrediction.sportingScorers,
        }
      : null,
    isCurrentUser: true,
    isFriend: false,
  };
}

/**
 * Filters and ranks leaderboard entries for either global ('all') or friends ('friends') view.
 * Recomputes sequential 1-based ranks within the active subset.
 *
 * @param entries - Raw leaderboard entries.
 * @param filter - Active tab ('all' | 'friends').
 * @returns Sorted and re-ranked leaderboard entries.
 */
export function filterAndRankLeaderboard(
  entries: readonly PorraLeaderboardEntry[],
  filter: PorraLeaderboardFilter
): PorraLeaderboardEntry[] {
  const subset =
    filter === 'friends'
      ? entries.filter((e) => Boolean(e.isFriend || e.isCurrentUser))
      : [...entries];

  subset.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactScoresCount !== a.exactScoresCount) {
      return b.exactScoresCount - a.exactScoresCount;
    }
    if (b.outcomesCount !== a.outcomesCount) {
      return b.outcomesCount - a.outcomesCount;
    }
    return a.userName.localeCompare(b.userName, 'es');
  });

  return subset.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
