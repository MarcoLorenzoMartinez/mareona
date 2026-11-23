// Client: Reacciona a la pérdida, degradación y recuperación de conexión del navegador
"use client";

import { useEffect, useRef } from "react";
import { useNetworkQuality } from "@/lib/pwa/use-network-quality";
import { toast } from "@/lib/ui/toast";
import { getDictionary } from "@/i18n";

/**
 * Slim status bar shown while offline or experiencing poor stadium coverage,
 * plus a toast once full connectivity returns. Stays hidden on healthy links.
 */
export function OfflineBanner() {
  const dict = getDictionary();
  const { isOnline, isDegraded } = useNetworkQuality();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success(dict.pwa.offlineBanner.reconnectedToast);
    }
  }, [isOnline, dict.pwa.offlineBanner.reconnectedToast]);

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-[var(--foreground)] px-4 py-2 text-center text-xs font-medium text-white"
      >
        {dict.pwa.offlineBanner.statusText}
      </div>
    );
  }

  if (isDegraded) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-950"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse"
        />
        <span>{dict.pwa.offlineBanner.degradedText}</span>
      </div>
    );
  }

  return null;
}
