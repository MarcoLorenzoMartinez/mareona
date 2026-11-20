/**
 * Logic for Sporting match MVP voting and community rating aggregations.
 */

/**
 * Computes updated MVP vote counts when a user casts or transfers their vote.
 * Ensures a user only ever has 1 vote active by subtracting from previous candidate.
 *
 * @param currentVotes Current mapping of playerId to vote counts.
 * @param newPlayerId The candidate playerId receiving the vote.
 * @param previousPlayerId The previous candidate playerId (if user had already voted).
 * @returns Updated record of votes.
 */
export function applyMvpVoteTransition(
  currentVotes: Readonly<Record<string, number>>,
  newPlayerId: string,
  previousPlayerId?: string | null
): Record<string, number> {
  const next: Record<string, number> = { ...currentVotes };

  if (previousPlayerId && previousPlayerId !== newPlayerId) {
    const prevCount = next[previousPlayerId] ?? 0;
    if (prevCount > 0) {
      next[previousPlayerId] = prevCount - 1;
    }
  }

  next[newPlayerId] = (next[newPlayerId] ?? 0) + 1;
  return next;
}

/**
 * Aggregates raw MVP vote rows from Supabase into a count map indexed by playerId.
 *
 * @param rows - Array of persisted MVP vote rows containing `player_id`.
 * @returns Vote count map indexed by `player_id`.
 */
export function aggregateMvpVotes(
  rows: ReadonlyArray<{ readonly player_id: string }>
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (!row.player_id) continue;
    counts[row.player_id] = (counts[row.player_id] ?? 0) + 1;
  }
  return counts;
}

/**
 * Aggregates raw player/coach rating rows from Supabase into 1-decimal averages per targetId.
 * Rating `0` represents "N/C" (not ratable) and is excluded from the numeric average.
 *
 * @param rows - Array of persisted rating rows containing `target_id` and numeric `rating`.
 * @returns Average rating (1..10, 1 decimal) map indexed by `target_id`.
 */
export function aggregatePlayerRatings(
  rows: ReadonlyArray<{ readonly target_id: string; readonly rating: number }>
): Record<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();

  for (const row of rows) {
    if (!row.target_id || row.rating <= 0 || row.rating > 10) continue;
    const entry = totals.get(row.target_id) ?? { sum: 0, count: 0 };
    entry.sum += row.rating;
    entry.count += 1;
    totals.set(row.target_id, entry);
  }

  const averages: Record<string, number> = {};
  for (const [targetId, { sum, count }] of totals.entries()) {
    if (count > 0) {
      averages[targetId] = Math.round((sum / count) * 10) / 10;
    }
  }
  return averages;
}
