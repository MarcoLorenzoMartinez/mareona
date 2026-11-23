// Client: Suscripción reactiva al estado de conectividad y detección de cobertura débil
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useOnlineStatus } from "./use-online-status";
import {
  DEGRADED_COOLDOWN_MS,
  isNetworkDegraded,
  isSlowNetworkConnectionInfo,
  subscribeNetworkQuality,
  type NetworkConnectionLike,
} from "./network-quality";

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkConnectionLike & {
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
}

function subscribeConnection(onChange: () => void): () => void {
  const unsubQuality = subscribeNetworkQuality(onChange);
  const conn = (navigator as NavigatorWithConnection).connection;
  conn?.addEventListener?.("change", onChange);

  const intervalId = setInterval(() => {
    // Re-evaluates cooldown expiry even when no new requests are fired
    isNetworkDegraded();
  }, Math.min(DEGRADED_COOLDOWN_MS, 5000));

  return () => {
    unsubQuality();
    conn?.removeEventListener?.("change", onChange);
    clearInterval(intervalId);
  };
}

function getDegradedSnapshot(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as NavigatorWithConnection).connection;
  return isNetworkDegraded() || isSlowNetworkConnectionInfo(conn);
}

/**
 * Combines `navigator.onLine` with real request latency/timeout tracking
 * and NetworkInformation API to detect poor stadium coverage ("lie-fi").
 *
 * @returns `{ isOnline, isDegraded }` where `isDegraded` is true only while online with poor quality.
 */
export function useNetworkQuality(): {
  readonly isOnline: boolean;
  readonly isDegraded: boolean;
} {
  const isOnline = useOnlineStatus();
  const isSlowOrFailing = useSyncExternalStore(
    subscribeConnection,
    getDegradedSnapshot,
    () => false
  );

  // Clear stale degraded state check on mount/visibility return
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        isNetworkDegraded();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return {
    isOnline,
    isDegraded: isOnline && isSlowOrFailing,
  };
}
