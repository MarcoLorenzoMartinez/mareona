// Client: Escucha el estado de conexión y sincroniza la cola de partidas offline
"use client";

import { useEffect, useRef } from "react";
import { processOfflineGameSync } from "@/lib/games/offline-sync-queue";
import { syncOfflineGamesAction } from "@/lib/games/offline-sync-action";
import { toast } from "@/lib/ui/toast";

/**
 * Global background listener that automatically synchronizes offline game results
 * when network connectivity is established or restored.
 */
export function OfflineSyncListener() {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function triggerSync() {
      if (typeof window === "undefined" || !navigator.onLine || isSyncingRef.current) {
        return;
      }
      isSyncingRef.current = true;
      try {
        const result = await processOfflineGameSync(async (events) => {
          return await syncOfflineGamesAction({ events: [...events] });
        });

        if (isMounted && result.syncedCount > 0) {
          toast.success(
            result.syncedCount === 1
              ? "Partida sincronizada con éxito"
              : `${result.syncedCount} partidas sincronizadas con éxito`,
            { description: "Tus rachas y recompensas han sido registradas." }
          );
        }
      } catch {
        // Sync failure will retry on next reconnect event
      } finally {
        isSyncingRef.current = false;
      }
    }

    // Attempt sync on initial mount if already online
    triggerSync();

    const handleOnline = () => triggerSync();
    const handleQueueUpdated = () => {
      if (navigator.onLine) {
        triggerSync();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("mareona_offline_sync_queue_updated", handleQueueUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("mareona_offline_sync_queue_updated", handleQueueUpdated);
    };
  }, []);

  return null;
}
