// Client: Escucha el estado de conectividad para alternar automáticamente entre la app y la vista offline
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";
import { isOfflineRoute } from "@/lib/pwa/offline-routes";

/**
 * Handles automatic bi-directional transitions between online and offline states:
 * - When losing connectivity on a route that requires network, redirects to `/offline`.
 * - When regaining connectivity on `/offline`, returns to `/` or reloads the active view.
 */
export function OfflineTransitionListener() {
  const isOnline = useOnlineStatus();
  const pathname = usePathname();
  const router = useRouter();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      if (!isOfflineRoute(pathname)) {
        router.replace("/offline");
      }
    } else if (wasOffline.current) {
      wasOffline.current = false;
      if (pathname === "/offline") {
        router.replace("/");
      } else {
        window.location.reload();
      }
    }
  }, [isOnline, pathname, router]);

  return null;
}
