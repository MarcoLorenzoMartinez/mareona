// Client: Hook reactivo para sincronización en vivo del partido actual/próximo
"use client";

import { useState, useEffect, useCallback } from "react";
import { getLiveNextFixtureUpdate } from "./live-actions";
import { LIVE_POLL_INTERVAL_MS, shouldPollMatch } from "@/lib/sports-api/live-poll";
import type { DomainMatchSummary } from "@/lib/sports-api/types";

/**
 * React hook that manages live polling for the spotlighted next fixture.
 * Polling triggers when the match is in progress ('live') or entering scheduled kickoff window,
 * and pauses when the tab is hidden or when the match is officially 'finished'.
 *
 * @param initialMatch Pre-rendered match summary state from Server Component.
 * @returns Current match summary state and isLive indicator.
 */
export function useLiveFixturePoll(initialMatch: DomainMatchSummary | null) {
  const [match, setMatch] = useState<DomainMatchSummary | null>(initialMatch);
  const isLive = match?.status === "live";

  const fetchUpdate = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    try {
      const update = await getLiveNextFixtureUpdate();
      if (update) {
        setMatch(update);
      }
    } catch {
      // Retain existing score state on transient network fluctuations
    }
  }, []);

  useEffect(() => {
    const shouldPoll = shouldPollMatch(match?.status, true, match?.kickoffAt);
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
  }, [match?.status, match?.kickoffAt, fetchUpdate]);

  return { match, isLive };
}
