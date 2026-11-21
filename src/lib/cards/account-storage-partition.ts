import {
  isSyncedGameStorageKey,
  mergeSyncedGameStorageEntries,
} from "./account-games-sync.ts";
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

export interface SwitchGameStorageResult {
  readonly switched: boolean;
  readonly absorbedGuest: boolean;
}

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

function readBucketSnapshot(storage: Storage, bucketId: string): Record<string, string> {
  try {
    const raw = storage.getItem(getBucketKey(bucketId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (isPartitionedGameKey(k) && typeof v === "string") {
        clean[k] = v;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

function mergeGuestIntoAccountBucket(
  accountBucket: Readonly<Record<string, string>>,
  guestSnapshot: Readonly<Record<string, string>>
): Record<string, string> {
  const merged = mergeSyncedGameStorageEntries(accountBucket, guestSnapshot, "reconcile");
  for (const [k, v] of Object.entries(accountBucket)) {
    if (!(k in merged) && !DERIVED_STATS_KEYS.has(k)) {
      merged[k] = v;
    }
  }
  for (const [k, v] of Object.entries(guestSnapshot)) {
    if (!(k in merged) && !DERIVED_STATS_KEYS.has(k)) {
      merged[k] = v;
    }
  }
  return merged;
}

/**
 * Isolates localStorage game/lineup keys per authenticated userId and performs
 * a safe, single-consume guest-to-account merge (account wins on conflict) when
 * a guest signs in or registers.
 *
 * @param nextUserId - Authenticated Supabase user ID, or null/undefined for guest mode.
 * @returns Transition outcome indicating whether a partition switch and guest merge occurred.
 */
export function switchGameStorageUser(
  nextUserId: string | null | undefined
): SwitchGameStorageResult {
  if (typeof window === "undefined" || !window.localStorage) {
    return { switched: false, absorbedGuest: false };
  }

  const storage = window.localStorage;
  const nextBucketId = nextUserId || "guest";
  const prevBucketId = storage.getItem(ACTIVE_GAME_USER_KEY);

  if (!prevBucketId) {
    storage.setItem(ACTIVE_GAME_USER_KEY, nextBucketId);
    return { switched: false, absorbedGuest: false };
  }

  if (prevBucketId === nextBucketId) {
    return { switched: false, absorbedGuest: false };
  }

  try {
    const outgoingSnapshot = collectCurrentPartitionedKeys(storage);
    const isGuestToAccount = prevBucketId === "guest" && nextBucketId !== "guest";
    let absorbedGuest = false;

    for (const key of Object.keys(outgoingSnapshot)) {
      storage.removeItem(key);
    }

    let nextEntries: Record<string, string>;
    if (isGuestToAccount) {
      const accountBucket = readBucketSnapshot(storage, nextBucketId);
      const guestEntriesCount = Object.keys(outgoingSnapshot).filter(
        (k) => !DERIVED_STATS_KEYS.has(k)
      ).length;
      nextEntries = mergeGuestIntoAccountBucket(accountBucket, outgoingSnapshot);
      storage.removeItem(getBucketKey("guest"));
      absorbedGuest = guestEntriesCount > 0;
    } else {
      storage.setItem(getBucketKey(prevBucketId), JSON.stringify(outgoingSnapshot));
      nextEntries = readBucketSnapshot(storage, nextBucketId);
    }

    for (const [key, val] of Object.entries(nextEntries)) {
      storage.setItem(key, val);
    }

    storage.setItem(ACTIVE_GAME_USER_KEY, nextBucketId);

    getInitialWordleStats();
    getStoredTriviaStats();
    getStoredWhoAreYaStats();

    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("mareona_account_state_synced"));
    }
    return { switched: true, absorbedGuest };
  } catch {
    storage.setItem(ACTIVE_GAME_USER_KEY, nextBucketId);
    return { switched: false, absorbedGuest: false };
  }
}
