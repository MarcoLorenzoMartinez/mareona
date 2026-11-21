// Client: Sincronización reactiva del estado de cuenta (álbum, sobres, misiones, juegos, porra y once)
"use client";

import {
  ALBUM_SYNC_REVISION_KEY,
  hasAlbumActivity,
  type AccountAlbumSnapshot,
} from "./account-sync";
import { isSyncedGameStorageKey } from "./account-games-sync";
import { syncUserAlbumStateWithServer } from "./actions";
import {
  loadStoredMissionState,
  loadUserCardInventory,
  loadUserPackInventory,
  saveStoredMissionState,
  saveUserCardInventory,
  saveUserPackInventory,
} from "./pack-storage";
import { PORRA_CLAIMED_REWARDS_KEY, saveStoredPrediction } from "@/lib/porra/storage";
import { getInitialWordleStats } from "@/lib/wordle/storage";
import { getStoredTriviaStats } from "@/lib/trivia/storage";
import { getStoredWhoAreYaStats } from "@/lib/who-are-ya/storage";

function getRevisionStorageKey(userId: string): string {
  return `${ALBUM_SYNC_REVISION_KEY}_${userId}`;
}

/**
 * Collects all cross-device game, lineup, and porra reward entries from localStorage.
 */
function collectLocalGameStorageEntries(userId: string): Record<string, string> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  const entries: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (isSyncedGameStorageKey(key)) {
        const val = window.localStorage.getItem(key);
        if (val) entries[key] = val;
      }
    }
    const userClaimedRaw = window.localStorage.getItem(`${PORRA_CLAIMED_REWARDS_KEY}_${userId}`);
    if (userClaimedRaw) {
      entries[PORRA_CLAIMED_REWARDS_KEY] = userClaimedRaw;
    }
  } catch {
    // LocalStorage iteration fallback
  }
  return entries;
}

/**
 * Reads the last server-acknowledged sync revision for this user on the current device.
 */
export function loadAlbumSyncRevision(userId?: string): number {
  if (typeof window === "undefined" || !userId) return 0;
  try {
    const raw = window.localStorage.getItem(getRevisionStorageKey(userId));
    const parsed = Number(raw ?? "0");
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
}

/**
 * Persists the latest server-acknowledged sync revision for this user on the current device.
 */
export function saveAlbumSyncRevision(revision: number, userId?: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(getRevisionStorageKey(userId), String(Math.max(0, Math.floor(revision))));
  } catch {
    // LocalStorage quota fallback
  }
}

/**
 * Captures the current local device state for cards, packs, missions, and games into a snapshot.
 */
export function buildLocalAccountAlbumSnapshot(userId: string): AccountAlbumSnapshot {
  const cards = loadUserCardInventory(userId);
  const packs = loadUserPackInventory(userId);
  const missions = loadStoredMissionState(userId);
  const storageEntries = collectLocalGameStorageEntries(userId);
  const revision = loadAlbumSyncRevision(userId);

  return {
    cards,
    packs,
    missions,
    storageEntries,
    hasActivity:
      revision > 0 ||
      hasAlbumActivity(cards, missions) ||
      Object.keys(storageEntries).length > 0,
    revision,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Applies an authoritative server snapshot into localStorage and notifies all active UI hooks.
 */
export function applyServerAccountAlbumSnapshot(
  userId: string,
  snapshot: AccountAlbumSnapshot
): void {
  if (typeof window === "undefined" || !userId) return;

  if (snapshot.storageEntries) {
    for (const [key, val] of Object.entries(snapshot.storageEntries)) {
      if (!isSyncedGameStorageKey(key) || !val) continue;
      try {
        window.localStorage.setItem(key, val);
        if (key === PORRA_CLAIMED_REWARDS_KEY) {
          window.localStorage.setItem(`${PORRA_CLAIMED_REWARDS_KEY}_${userId}`, val);
        }
      } catch {
        // Quota fallback
      }
    }
    getInitialWordleStats();
    getStoredTriviaStats();
    getStoredWhoAreYaStats();
  }

  if (snapshot.porraPredictions) {
    for (const pred of Object.values(snapshot.porraPredictions)) {
      saveStoredPrediction(pred, userId);
    }
  }

  saveUserCardInventory(snapshot.cards, userId);
  saveUserPackInventory(snapshot.packs, userId);
  saveStoredMissionState(snapshot.missions, userId);
  saveAlbumSyncRevision(snapshot.revision, userId);

  window.dispatchEvent(new CustomEvent("mareona_account_state_synced"));
}

/**
 * Performs a round-trip reconciliation or push with Supabase and updates local state.
 */
export async function syncAlbumAccountWithServer(
  userId: string | undefined,
  mode: "reconcile" | "push"
): Promise<AccountAlbumSnapshot | null> {
  if (typeof window === "undefined" || !userId) return null;

  try {
    const clientSnapshot = buildLocalAccountAlbumSnapshot(userId);
    const serverSnapshot = await syncUserAlbumStateWithServer({
      mode,
      clientSnapshot,
    });
    if (serverSnapshot) {
      applyServerAccountAlbumSnapshot(userId, serverSnapshot);
    }
    return serverSnapshot;
  } catch {
    return null;
  }
}
