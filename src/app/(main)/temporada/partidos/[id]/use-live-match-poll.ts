// Client: Hook para actualización en vivo (polling inteligente) de partidos en juego
"use client";

import { useState, useEffect, useCallback } from "react";
import { getLiveMatchUpdate } from "./actions";
import { LIVE_POLL_INTERVAL_MS } from "@/lib/sports-api/live-poll";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

/**
 * React hook that manages live polling for matches in progress.
 * Silently pauses when the user minimizes or switches browser tabs.
 *
 * @param initialMatch Pre-rendered match detail state from Server Component.
 * @returns The current match detail state and isLive flag.
 */
export function useLiveMatchPoll(initialMatch: DomainMatchDetail) {
  const [match, setMatch] = useState<DomainMatchDetail>(initialMatch);
  const matchId = initialMatch.externalId;
  const isLive = match.status === "live";

  const fetchUpdate = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    try {
      const update = await getLiveMatchUpdate(matchId);
      if (update) {
        setMatch(update);
      }
    } catch {
      // Retain existing state on transient network failures
    }
  }, [matchId]);

  useEffect(() => {
    if (!isLive) return;

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
  }, [isLive, fetchUpdate]);

  return { match, isLive };
}
