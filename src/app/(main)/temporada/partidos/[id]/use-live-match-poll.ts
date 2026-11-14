// Client: Hook para actualización en vivo (polling inteligente) de partidos en juego
"use client";

import { useState, useEffect, useCallback } from "react";
import { getLiveMatchUpdate } from "./actions";
import { LIVE_POLL_INTERVAL_MS, shouldPollMatch } from "@/lib/sports-api/live-poll";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

/**
 * React hook that manages live polling for matches in progress or entering kickoff window.
 * Silently pauses when the user minimizes or switches browser tabs, or when the match is finished.
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
    const shouldPoll = shouldPollMatch(match.status, true, match.kickoffAt);
    if (!shouldPoll) return;

    // Immediately fetch upon mount when in polling window to get live status without waiting
    const initialTimer = setTimeout(() => {
      void fetchUpdate();
    }, 0);

    const intervalId = setInterval(fetchUpdate, LIVE_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [match.status, match.kickoffAt, fetchUpdate]);

  return { match, isLive };
}
