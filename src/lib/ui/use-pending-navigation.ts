// Client: Estado pendiente inmediato al pulsar enlaces de navegación en móvil/escritorio
"use client";

import { useEffect, useState } from "react";

const PENDING_SAFETY_RESET_MS = 12_000;

/**
 * Tracks the destination href of an in-flight client navigation so tabs and
 * bottom-bar items can render immediate tactile/visual feedback before Next.js
 * finishes streaming the target route.
 *
 * @param pathname Current active pathname from `usePathname()`.
 * @returns `pendingHref`, `markPending(href)` to set on tap, and `isPending(href)`.
 */
export function usePendingNavigation(pathname: string | null) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (pendingHref !== null) {
      setPendingHref(null);
    }
  }

  useEffect(() => {
    if (pendingHref === null) return;
    const timer = setTimeout(() => {
      setPendingHref(null);
    }, PENDING_SAFETY_RESET_MS);
    return () => clearTimeout(timer);
  }, [pendingHref]);

  const markPending = (href: string, isCurrentActive: boolean) => {
    if (isCurrentActive) return;
    setPendingHref(href);
  };

  const isPending = (href: string): boolean => pendingHref === href;

  return { pendingHref, markPending, isPending };
}
