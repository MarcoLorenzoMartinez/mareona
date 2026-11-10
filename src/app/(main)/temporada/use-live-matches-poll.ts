// Client: Hook reactivo para sincronización en vivo del calendario de partidos
"use client";

import { useState, useEffect, useCallback } from "react";
import { getLiveSeasonMatchesUpdate } from "./live-actions";
import { LIVE_POLL_INTERVAL_MS } from "@/lib/sports-api/live-poll";
import type { DomainMatchSummary } from "@/lib/sports-api/types";

/**
 * React hook that manages live polling for the season matches list.
 * Automatically activates only when at least one match has status 'live'.
 * Pauses when browser tab is hidden to save mobile battery and bandwidth.
 *
 * @param initialMatches Pre-rendered matches list from Server Component.
 * @returns Current matches list with reactive score updates.
 */
export function useLiveMatchesPoll(initialMatches: readonly DomainMatchSummary[]) {
  const [matches, setMatches] = useState<readonly DomainMatchSummary[]>(initialMatches);
  const hasLiveMatch = matches.some((m) => m.status === "live");

  const fetchUpdate = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    try {
      const updated = await getLiveSeasonMatchesUpdate();
      if (updated && updated.length > 0) {
        setMatches(updated);
      }
    } catch {
      // Retain existing state on transient network failures
    }
  }, []);

  useEffect(() => {
    if (!hasLiveMatch) return;

    const intervalId = setInterval(fetchUpdate, LIVE_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLiveMatch, fetchUpdate]);

  return { matches, hasLiveMatch };
}
