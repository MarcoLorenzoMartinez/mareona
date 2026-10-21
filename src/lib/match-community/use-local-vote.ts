// Client: Hook para sincronizar votos locales de forma segura con React 19
"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Reads and synchronizes a localStorage key without triggering cascading renders.
 *
 * @param key The localStorage key to observe.
 * @returns The string value stored or null if unset or running in SSR.
 */
export function useLocalVote(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null
  );
}
