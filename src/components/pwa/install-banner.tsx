// Client: Lee localStorage/sessionStorage y la ruta actual para decidir si mostrar el aviso
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePwaInstall } from "./pwa-install-provider";
import { InstallAction } from "./install-action";
import {
  BANNER_DISMISSED_KEY,
  BANNER_SESSION_KEY,
  BANNER_VISITS_KEY,
  shouldShowInstallBanner,
} from "@/lib/pwa/install-banner";

interface EngagementState {
  readonly visits: number;
  readonly dismissedAt: number | null;
  readonly now: number;
}

/** Counts one visit per browser session; storage failures degrade to "no banner". */
function readEngagement(): EngagementState {
  const now = Date.now();
  try {
    let visits = Number(localStorage.getItem(BANNER_VISITS_KEY) ?? "0");
    if (!sessionStorage.getItem(BANNER_SESSION_KEY)) {
      sessionStorage.setItem(BANNER_SESSION_KEY, "1");
      visits += 1;
      localStorage.setItem(BANNER_VISITS_KEY, String(visits));
    }
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    return { visits, dismissedAt: dismissed ? Number(dismissed) : null, now };
  } catch {
    return { visits: 0, dismissedAt: null, now };
  }
}

/**
 * Mobile-only install invitation shown above the bottom navigation to returning
 * visitors. Dismissal is remembered so it never nags.
 */
export function InstallBanner() {
  const { platform } = usePwaInstall();
  const pathname = usePathname();
  const [engagement, setEngagement] = useState<EngagementState | null>(null);

  useEffect(() => {
    // Storage is browser-only, so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEngagement(readEngagement());
  }, []);

  const handleDismiss = () => {
    const now = Date.now();
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, String(now));
    } catch {
      // Dismissal still applies for this page view via state.
    }
    setEngagement((prev) => ({ visits: prev?.visits ?? 0, dismissedAt: now, now }));
  };

  const isVisible =
    engagement !== null &&
    shouldShowInstallBanner({ platform, pathname, ...engagement });
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Instalar Mareona"
      className="fixed inset-x-3 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] z-40 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3 shadow-md md:hidden"
    >
      <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[var(--foreground)]">Mareona en tu móvil</p>
        <p className="truncate text-xs text-[var(--muted-foreground)]">Acceso directo y juegos sin conexión</p>
      </div>
      <InstallAction
        label="Instalar"
        className="min-h-11 shrink-0 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white transition-transform duration-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 inline-flex items-center"
      />
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Ocultar aviso de instalación"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] active:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </aside>
  );
}
