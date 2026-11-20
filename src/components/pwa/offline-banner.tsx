// Client: Reacciona a la pérdida y recuperación de conexión del navegador
"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";
import { toast } from "@/lib/ui/toast";
import { getDictionary } from "@/i18n";

/**
 * Slim status bar shown while offline, plus a toast once connectivity returns.
 * Stays out of the way online: it renders nothing.
 */
export function OfflineBanner() {
  const dict = getDictionary();
  const isOnline = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success(dict.pwa.offlineBanner.reconnectedToast);
    }
  }, [isOnline, dict.pwa.offlineBanner.reconnectedToast]);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="w-full bg-[var(--foreground)] px-4 py-2 text-center text-xs font-medium text-white"
    >
      {dict.pwa.offlineBanner.statusText}
    </div>
  );
}
