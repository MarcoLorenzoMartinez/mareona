import { addPacksToInventory } from '../cards/pack-storage.ts';
import { resolveUnclaimedPorraRewards } from './engine.ts';
import type {
  PorraMatch,
  PorraPrediction,
  PorraUnclaimedReward,
} from './types.ts';

export const PORRA_STORAGE_PREFIX = 'mareona_porra_prediction_';
export const PORRA_CLAIMED_REWARDS_KEY = 'mareona_porra_claimed_rewards_v1';

function getPredictionKey(matchId: string, userId?: string): string {
  return userId
    ? `${PORRA_STORAGE_PREFIX}${userId}_${matchId}`
    : `${PORRA_STORAGE_PREFIX}${matchId}`;
}

function getClaimedRewardsKey(userId?: string): string {
  return userId
    ? `${PORRA_CLAIMED_REWARDS_KEY}_${userId}`
    : PORRA_CLAIMED_REWARDS_KEY;
}

/**
 * Retrieves a stored prediction for a specific match, falling back to legacy un-scoped key.
 *
 * @param matchId - External match identifier.
 * @param userId - Optional authenticated user ID.
 * @returns Stored prediction or null if none exists.
 */
export function getStoredPrediction(
  matchId: string,
  userId?: string
): PorraPrediction | null {
  if (typeof window === 'undefined') return null;
  try {
    const primaryRaw = window.localStorage.getItem(getPredictionKey(matchId, userId));
    if (primaryRaw) {
      return JSON.parse(primaryRaw) as PorraPrediction;
    }
    const legacyRaw = window.localStorage.getItem(`${PORRA_STORAGE_PREFIX}${matchId}`);
    if (legacyRaw) {
      return JSON.parse(legacyRaw) as PorraPrediction;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists a user prediction for a match in localStorage.
 *
 * @param prediction - Prediction payload to store.
 * @param userId - Optional authenticated user ID.
 */
export function saveStoredPrediction(
  prediction: PorraPrediction,
  userId?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(prediction);
    window.localStorage.setItem(getPredictionKey(prediction.matchId, userId), serialized);
    // Keep un-scoped key synchronized so predictions made prior to sign-in remain accessible
    window.localStorage.setItem(`${PORRA_STORAGE_PREFIX}${prediction.matchId}`, serialized);
  } catch {
    // Quota fallback
  }
}

/**
 * Loads the set of match IDs whose Porra booster pack rewards have already been claimed.
 *
 * @param userId - Optional authenticated user ID.
 * @returns Set of claimed match IDs.
 */
export function getClaimedPorraMatchIds(userId?: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(getClaimedRewardsKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

/**
 * Marks a list of match IDs as having had their Porra rewards claimed.
 *
 * @param matchIds - Match IDs to mark as claimed.
 * @param userId - Optional authenticated user ID.
 */
export function markPorraRewardsClaimed(
  matchIds: readonly string[],
  userId?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getClaimedPorraMatchIds(userId);
    for (const id of matchIds) {
      current.add(id);
    }
    window.localStorage.setItem(
      getClaimedRewardsKey(userId),
      JSON.stringify(Array.from(current))
    );
  } catch {
    // Quota fallback
  }
}

/**
 * Evaluates all finished matches against stored predictions and returns any unclaimed pack rewards.
 *
 * @param finishedMatches - Completed matches from the season schedule.
 * @param userId - Optional authenticated user ID.
 * @returns List of unclaimed Porra rewards sorted from newest to oldest.
 */
export function getPendingPorraRewards(
  finishedMatches: readonly PorraMatch[],
  userId?: string
): PorraUnclaimedReward[] {
  if (typeof window === 'undefined') return [];

  const predictionsByMatchId: Record<string, PorraPrediction> = {};
  for (const match of finishedMatches) {
    const pred = getStoredPrediction(match.id, userId);
    if (pred) {
      predictionsByMatchId[match.id] = pred;
    }
  }

  const claimedIds = getClaimedPorraMatchIds(userId);
  return resolveUnclaimedPorraRewards(finishedMatches, predictionsByMatchId, claimedIds);
}

/**
 * Claims all pending Porra booster pack rewards, adding them directly to the user's Album pack inventory
 * without opening them automatically.
 *
 * @param rewards - Unclaimed rewards to claim.
 * @param userId - Authenticated user ID.
 * @returns Total number of packs added to inventory.
 */
export function claimPorraRewards(
  rewards: readonly PorraUnclaimedReward[],
  userId: string
): number {
  if (!userId || rewards.length === 0) return 0;

  for (const reward of rewards) {
    addPacksToInventory(reward.rewardTier, 1, userId);
  }

  markPorraRewardsClaimed(
    rewards.map((r) => r.match.id),
    userId
  );

  return rewards.length;
}
