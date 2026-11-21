// Client: Escucha el estado de conexión y sincroniza la cola de partidas offline y estado de cuenta
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { syncAlbumAccountWithServer } from "@/lib/cards/account-sync-client";
import { switchGameStorageUser } from "@/lib/cards/account-storage-partition";
import { processOfflineGameSync, getOfflineGameQueue } from "@/lib/games/offline-sync-queue";
import { syncOfflineGamesAction } from "@/lib/games/offline-sync-action";
import { toast } from "@/lib/ui/toast";
import { getDictionary } from "@/i18n";

/**
 * Global background listener that isolates per-account local storage partitions,
 * synchronizes offline game results, and reconciles cross-device account state
 * when connectivity, focus, or auth session changes.
 */
export function OfflineSyncListener() {
  const dict = getDictionary();
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    let isMounted = true;
    let pushDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    switchGameStorageUser(userId ?? null);

    async function triggerSync(notifyUser = false, syncMode: "reconcile" | "push" = "reconcile") {
      if (typeof window === "undefined" || !navigator.onLine || isSyncingRef.current) {
        return;
      }
      isSyncingRef.current = true;
      try {
        switchGameStorageUser(userId ?? null);

        if (userId) {
          await syncAlbumAccountWithServer(userId, syncMode);
        }

        const result = await processOfflineGameSync(async (events) => {
          return await syncOfflineGamesAction({ events: [...events] });
        });

        if (isMounted && result.syncedCount > 0 && notifyUser) {
          toast.success(
            result.syncedCount === 1
              ? dict.pwa.offlineSync.oneSyncedTitle
              : `${result.syncedCount} ${dict.pwa.offlineSync.manySyncedSuffix}`,
            { description: dict.pwa.offlineSync.syncedDescription }
          );
        }
      } catch {
        // Sync failure will retry on next reconnect event
      } finally {
        isSyncingRef.current = false;
      }
    }

    const pendingOnMount = getOfflineGameQueue().length;
    if (pendingOnMount > 0) {
      void triggerSync(true, "reconcile");
    } else {
      void triggerSync(false, "reconcile");
    }

    const handleOnline = () => {
      void triggerSync(true, "reconcile");
    };

    const handleQueueUpdated = () => {
      if (navigator.onLine) {
        void triggerSync(false, "push");
      }
    };

    const handleLocalMutation = () => {
      if (!navigator.onLine || !userId) return;
      if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
      pushDebounceTimer = setTimeout(() => {
        void triggerSync(false, "push");
      }, 250);
    };

    const handleFocus = () => {
      if (navigator.onLine && userId) {
        void triggerSync(false, "reconcile");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine && userId) {
        void triggerSync(false, "reconcile");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("mareona_offline_sync_queue_updated", handleQueueUpdated);
    window.addEventListener("mareona_local_account_mutated", handleLocalMutation);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("mareona_offline_sync_queue_updated", handleQueueUpdated);
      window.removeEventListener("mareona_local_account_mutated", handleLocalMutation);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    userId,
    isLoading,
    dict.pwa.offlineSync.manySyncedSuffix,
    dict.pwa.offlineSync.oneSyncedTitle,
    dict.pwa.offlineSync.syncedDescription,
  ]);

  return null;
}
