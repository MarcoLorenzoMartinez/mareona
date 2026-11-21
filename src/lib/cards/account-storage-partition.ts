import { isSyncedGameStorageKey } from "./account-games-sync.ts";
import { getInitialWordleStats } from "../wordle/storage.ts";
import { getStoredTriviaStats } from "../trivia/storage.ts";
import { getStoredWhoAreYaStats } from "../who-are-ya/storage.ts";

export const ACTIVE_GAME_USER_KEY = "mareona_active_game_user_v1";
export const USER_GAMES_BUCKET_PREFIX = "mareona_user_games_bucket_v1_";

const DERIVED_STATS_KEYS = new Set([
  "mareona_wordle_v2_stats",
  "mareona_trivia_stats",
  "mareona_who_are_ya_stats",
]);

const PORRA_LEGACY_PREFIX = "mareona_porra_prediction_";
const UUID_SCOPED_PORRA_REGEX =
  /^mareona_porra_prediction_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;

function isPartitionedGameKey(key: string): boolean {
  if (isSyncedGameStorageKey(key) || DERIVED_STATS_KEYS.has(key)) {
    return true;
  }
  if (key.startsWith(PORRA_LEGACY_PREFIX) && !UUID_SCOPED_PORRA_REGEX.test(key)) {
    return true;
  }
  return false;
}

function getBucketKey(bucketId: string): string {
  return `${USER_GAMES_BUCKET_PREFIX}${bucketId}`;
}

function collectCurrentPartitionedKeys(storage: Storage): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !isPartitionedGameKey(key)) continue;
    const val = storage.getItem(key);
    if (val !== null) snapshot[key] = val;
  }
  return snapshot;
}

/**
 * Isolates unscoped localStorage game/lineup keys per authenticated userId so switching
 * accounts on the same browser never leaks or mixes game boards, stats, or lineups.
 *
 * @param nextUserId - Authenticated Supabase user ID, or null/undefined for guest mode.
 * @returns True if an account partition switch occurred.
 */
export function switchGameStorageUser(nextUserId: string | null | undefined): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  const storage = window.localStorage;
  const nextBucketId = nextUserId || "guest";
  const prevBucketId = storage.getItem(ACTIVE_GAME_USER_KEY);

  if (!prevBucketId) {
    storage.setItem(ACTIVE_GAME_USER_KEY, nextBucketId);
    return false;
  }

  if (prevBucketId === nextBucketId) {
    return false;
  }

  try {
    const outgoingSnapshot = collectCurrentPartitionedKeys(storage);
    storage.setItem(getBucketKey(prevBucketId), JSON.stringify(outgoingSnapshot));

    for (const key of Object.keys(outgoingSnapshot)) {
      storage.removeItem(key);
    }

    const incomingRaw = storage.getItem(getBucketKey(nextBucketId));
    if (incomingRaw) {
      const parsed = JSON.parse(incomingRaw) as Record<string, string>;
      if (parsed && typeof parsed === "object") {
        for (const [key, val] of Object.entries(parsed)) {
          if (isPartitionedGameKey(key) && typeof val === "string") {
            storage.setItem(key, val);
          }
        }
      }
    }

    storage.setItem(ACTIVE_GAME_USER_KEY, nextBucketId);

    getInitialWordleStats();
    getStoredTriviaStats();
    getStoredWhoAreYaStats();

    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("mareona_account_state_synced"));
    }
    return true;
  } catch {
    storage.setItem(ACTIVE_GAME_USER_KEY, nextBucketId);
    return false;
  }
}
