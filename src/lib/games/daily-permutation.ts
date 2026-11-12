/**
 * Mulberry32 32-bit pseudorandom number generator (PRNG).
 * Produces uniform 32-bit pseudorandom numbers from an integer seed.
 *
 * @param seed - Integer seed for deterministic generation.
 * @returns PRNG function returning float in [0, 1).
 */
function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a full deterministic Fisher-Yates permutation for a given round.
 * Guarantees that every index from 0 to totalCount - 1 appears exactly once per round,
 * eliminating duplicates until all catalog items have been consumed.
 *
 * @param totalCount - Total number of elements in the catalog.
 * @param roundNumber - Current round/cycle index (0, 1, 2...).
 * @param salt - Game-specific salt to decouple orders between different games.
 * @param round0FirstIndex - Optional designated index placed at day 0 of round 0.
 * @returns Shuffled array containing every index exactly once.
 */
export function getDailyRoundPermutation(
  totalCount: number,
  roundNumber: number,
  salt = 1905,
  round0FirstIndex?: number
): number[] {
  if (totalCount <= 0) return [];
  if (totalCount === 1) return [0];

  // Prime multiplier (10007) decouples consecutive rounds into distinct shuffles
  const seed = (salt + roundNumber * 10007) >>> 0;
  const rng = createMulberry32(seed);

  const indices: number[] = Array.from({ length: totalCount }, (_, i) => i);

  for (let i = totalCount - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  // If a curated historic milestone is designated for launch (Round 0, Day 0),
  // swap it cleanly to the first slot without duplicating or dropping any item.
  if (
    roundNumber === 0 &&
    typeof round0FirstIndex === 'number' &&
    round0FirstIndex >= 0 &&
    round0FirstIndex < totalCount
  ) {
    const currentPos = indices.indexOf(round0FirstIndex);
    if (currentPos !== -1 && currentPos !== 0) {
      const temp = indices[0];
      indices[0] = indices[currentPos];
      indices[currentPos] = temp;
    }
  }

  return indices;
}

/**
 * Resolves the deterministic shuffled catalog index for a given elapsed day.
 *
 * @param daysElapsed - Number of days since game epoch (0 = day 1).
 * @param totalCount - Total number of items in the catalog.
 * @param salt - Game-specific salt.
 * @param round0FirstIndex - Optional designated index placed at day 0 of round 0.
 * @returns Deterministic picked catalog index.
 */
export function getDailyPermutedIndex(
  daysElapsed: number,
  totalCount: number,
  salt = 1905,
  round0FirstIndex?: number
): number {
  if (totalCount <= 1) return 0;
  const safeDays = Math.max(0, Math.floor(daysElapsed));
  const roundNumber = Math.floor(safeDays / totalCount);
  const stepInRound = safeDays % totalCount;

  const permutation = getDailyRoundPermutation(totalCount, roundNumber, salt, round0FirstIndex);
  return permutation[stepInRound] ?? 0;
}
