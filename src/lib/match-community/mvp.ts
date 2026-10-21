/**
 * Logic for Sporting match MVP voting and vote transition calculations.
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
