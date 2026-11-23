// Client: Hook para actualización en vivo (polling inteligente) de partidos en juego
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLiveMatchUpdate } from "./actions";
import { LIVE_POLL_INTERVAL_MS, shouldPollMatch } from "@/lib/sports-api/live-poll";
import { runWithNetworkTimeout } from "@/lib/pwa/network-quality";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

/**
 * React hook that manages live polling for matches in progress or entering kickoff window.
 * Prevents stacked requests on slow cellular networks and reports sync staleness on failures.
 *
 * @param initialMatch Pre-rendered match detail state from Server Component.
 * @returns The current match detail state, isLive flag, and sync staleness indicator.
 */
export function useLiveMatchPoll(initialMatch: DomainMatchDetail) {
  const [match, setMatch] = useState<DomainMatchDetail>(initialMatch);
  const [isSyncStale, setIsSyncStale] = useState(false);
  const isFetchingRef = useRef(false);
  const matchId = initialMatch.externalId;
  const isLive = match.status === "live";

  const fetchUpdate = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    isFetchingRef.current = true;
    try {
      const update = await runWithNetworkTimeout(() => getLiveMatchUpdate(matchId));
      setIsSyncStale(false);
      if (update) {
        setMatch(update);
      }
    } catch {
      setIsSyncStale(true);
    } finally {
      isFetchingRef.current = false;
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
        void fetchUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [match.status, match.kickoffAt, fetchUpdate]);

  return { match, isLive, isSyncStale };
}
