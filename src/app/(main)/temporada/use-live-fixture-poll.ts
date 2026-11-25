// Client: Hook reactivo para sincronización en vivo del partido actual/próximo
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLiveNextFixtureUpdate } from "./live-actions";
import {
  LIVE_POLL_INTERVAL_MS,
  shouldPollMatch,
  shouldRefreshStaleSpotlight,
} from "@/lib/sports-api/live-poll";
import { runWithNetworkTimeout } from "@/lib/pwa/network-quality";
import type { DomainMatchSummary } from "@/lib/sports-api/types";

/**
 * React hook that manages live polling for the spotlighted next fixture.
 * Prevents overlapping requests on slow stadium networks, bounds polls by timeout,
 * and exposes `isSyncStale` when live updates cannot be refreshed.
 *
 * @param initialMatch Pre-rendered match summary state from Server Component.
 * @returns Current match summary state, isLive indicator, and sync staleness flag.
 */
export function useLiveFixturePoll(initialMatch: DomainMatchSummary | null) {
  const [match, setMatch] = useState<DomainMatchSummary | null>(initialMatch);
  const [isSyncStale, setIsSyncStale] = useState(false);
  const isFetchingRef = useRef(false);
  const attemptedStaleIdsRef = useRef<Set<string>>(new Set());
  const isLive = match?.status === "live";

  const fetchUpdate = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    isFetchingRef.current = true;
    try {
      const update = await runWithNetworkTimeout(() => getLiveNextFixtureUpdate());
      setIsSyncStale(false);
      if (update) {
        setMatch(update);
      }
    } catch {
      setIsSyncStale(true);
    } finally {
      isFetchingRef.current = false;
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
        void fetchUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [match?.status, match?.kickoffAt, fetchUpdate]);

  useEffect(() => {
    if (!match) return;
    const isPollingActive = shouldPollMatch(match.status, true, match.kickoffAt);
    if (isPollingActive) return;

    const triggerStaleRefreshIfNeeded = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (attemptedStaleIdsRef.current.has(match.externalId)) return;
      if (!shouldRefreshStaleSpotlight(match.status, true, match.kickoffAt)) return;

      attemptedStaleIdsRef.current.add(match.externalId);
      void fetchUpdate();
    };

    const timer = setTimeout(triggerStaleRefreshIfNeeded, 0);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerStaleRefreshIfNeeded();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [match, fetchUpdate]);

  return { match, isLive, isSyncStale };
}
