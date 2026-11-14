// Client: Escucha el estado de conexión y sincroniza la cola de partidas offline
"use client";

import { useEffect, useRef } from "react";
import { processOfflineGameSync, getOfflineGameQueue } from "@/lib/games/offline-sync-queue";
import { syncOfflineGamesAction } from "@/lib/games/offline-sync-action";
import { toast } from "@/lib/ui/toast";

/**
 * Global background listener that automatically synchronizes offline game results
 * when network connectivity is established or restored.
 *
 * UX Policy:
 * - When playing online: synchronization is completely silent and seamless (no toast).
 * - When reconnecting after playing offline (without coverage): a toast informs
 *   the user that their offline progress has been saved.
 */
export function OfflineSyncListener() {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function triggerSync(notifyUser = false) {
      if (typeof window === "undefined" || !navigator.onLine || isSyncingRef.current) {
        return;
      }
      isSyncingRef.current = true;
      try {
        const result = await processOfflineGameSync(async (events) => {
          return await syncOfflineGamesAction({ events: [...events] });
        });

        // Solo notificar al usuario si la sincronización proviene de una reconexión tras jugar sin cobertura
        if (isMounted && result.syncedCount > 0 && notifyUser) {
          toast.success(
            result.syncedCount === 1
              ? "Partida sin conexión sincronizada"
              : `${result.syncedCount} partidas sincronizadas`,
            { description: "Tus progresos jugados sin cobertura se han guardado con éxito." }
          );
        }
      } catch {
        // Sync failure will retry on next reconnect event
      } finally {
        isSyncingRef.current = false;
      }
    }

    // Al montar: si hay partidas acumuladas en la cola, significa que se jugaron previamente sin conexión
    const pendingOnMount = getOfflineGameQueue().length;
    if (pendingOnMount > 0) {
      triggerSync(true);
    } else {
      triggerSync(false);
    }

    // Reconexión tras caída o recuperación de red
    const handleOnline = () => triggerSync(true);

    // Partida finalizada en tiempo real: si hay red, se sincroniza en segundo plano de forma silenciosa
    const handleQueueUpdated = () => {
      if (navigator.onLine) {
        triggerSync(false);
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
