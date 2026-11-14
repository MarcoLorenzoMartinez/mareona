import { awardDailyGamePack } from "../cards/pack-storage.ts";
import type { QueuedGameEvent, SyncFlushResult } from "./offline-sync-types.ts";

export const OFFLINE_SYNC_STORAGE_KEY = "mareona_offline_game_sync_v1";

function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Loads currently queued offline game completion events from localStorage.
 */
export function getOfflineGameQueue(): QueuedGameEvent[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_SYNC_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedGameEvent[]) : [];
  } catch {
    return [];
  }
}

/**
 * Saves queued events back to localStorage.
 */
function saveQueue(queue: readonly QueuedGameEvent[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(OFFLINE_SYNC_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent("mareona_offline_sync_queue_updated", { detail: queue.length }));
  } catch {
    // Storage quota fallback
  }
}

/**
 * Enqueues a completed game result for deferred synchronization.
 * Automatically claims the local daily game pack if the challenge was won.
 */
export function enqueueGameResult(
  eventInput: Omit<QueuedGameEvent, "id">
): QueuedGameEvent {
  const currentQueue = getOfflineGameQueue();

  // Strict anti-cheat deduplication:
  // - Daily puzzles (Wordle, Who Are Ya, Trivia): the first completed attempt is final.
  //   A loss cannot be overwritten by a subsequent attempt after seeing the revealed answer.
  // - Arcade modes (Higher/Lower): can be replayed to improve the high score streak.
  const existingIndex = currentQueue.findIndex(
    (e) => e.gameType === eventInput.gameType && e.challengeDate === eventInput.challengeDate
  );

  if (existingIndex >= 0) {
    const existing = currentQueue[existingIndex];
    if (eventInput.gameType === "higher_lower") {
      const newScore = eventInput.score ?? 0;
      const oldScore = existing.score ?? 0;
      if (newScore > oldScore) {
        const updatedEvent: QueuedGameEvent = { ...eventInput, id: existing.id };
        const nextQueue = [...currentQueue];
        nextQueue[existingIndex] = updatedEvent;
        saveQueue(nextQueue);

        // If improved to a winning streak on a subsequent attempt and user is logged in, award daily pack
        if (updatedEvent.won && updatedEvent.userId) {
          try {
            awardDailyGamePack(updatedEvent.challengeDate, updatedEvent.userId);
          } catch {
            // Local pack allocation silent catch
          }
        }
        return updatedEvent;
      }
    }
    // For daily challenges or non-improving scores, keep the original first attempt
    return existing;
  }

  const newEvent: QueuedGameEvent = {
    ...eventInput,
    id: generateEventId(),
  };

  saveQueue([...currentQueue, newEvent]);

  // If won on the legitimate first attempt and user is logged in, grant the daily pack
  if (newEvent.won && newEvent.userId) {
    try {
      awardDailyGamePack(newEvent.challengeDate, newEvent.userId);
    } catch {
      // Local pack allocation silent catch
    }
  }

  return newEvent;
}

/**
 * Removes successfully processed events from the offline queue.
 */
export function removeQueuedGameEvents(ids: readonly string[]): void {
  if (ids.length === 0) return;
  const idSet = new Set(ids);
  const filtered = getOfflineGameQueue().filter((item) => !idSet.has(item.id));
  saveQueue(filtered);
}

/**
 * Clears all pending offline game events.
 */
export function clearOfflineGameQueue(): void {
  saveQueue([]);
}

/**
 * Flushes all pending queued events through the provided sync executor.
 */
export function processOfflineGameSync(
  syncHandler: (events: readonly QueuedGameEvent[]) => Promise<{
    readonly success: boolean;
    readonly syncedIds: readonly string[];
  }>
): Promise<SyncFlushResult> {
  const queue = getOfflineGameQueue();
  if (queue.length === 0) {
    return Promise.resolve({ success: true, syncedCount: 0, failedIds: [] });
  }

  return syncHandler(queue)
    .then(({ success, syncedIds }) => {
      if (syncedIds.length > 0) {
        removeQueuedGameEvents(syncedIds);
      }
      const syncedSet = new Set(syncedIds);
      const failed = queue.filter((e) => !syncedSet.has(e.id)).map((e) => e.id);
      return {
        success,
        syncedCount: syncedIds.length,
        failedIds: failed,
      };
    })
    .catch(() => ({
      success: false,
      syncedCount: 0,
      failedIds: queue.map((e) => e.id),
    }));
}
