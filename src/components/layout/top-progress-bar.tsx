// Client: Requiere interactividad para escuchar eventos de navegación y animar la barra de carga
"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  shouldTriggerProgressForClick,
  subscribeNavigationProgress,
} from "@/lib/ui/navigation-progress";
import { reportRequestOutcome } from "@/lib/pwa/network-quality";

const TRICKLE_INTERVAL_MS = 600;
const MAX_IN_FLIGHT_PROGRESS = 92;
const SAFETY_TIMEOUT_MS = 20_000;

function TopProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    timerRef.current = null;
    trickleRef.current = null;
    safetyRef.current = null;
  }, []);

  const startProgress = useCallback(() => {
    clearTimers();
    startedAtRef.current = Date.now();
    setIsVisible(true);
    setProgress(18);

    timerRef.current = setTimeout(() => {
      setProgress(52);
    }, 120);

    // Keep advancing slowly so slow stadium connections never look frozen at 65%
    trickleRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= MAX_IN_FLIGHT_PROGRESS) return prev;
        return Math.min(MAX_IN_FLIGHT_PROGRESS, prev + (MAX_IN_FLIGHT_PROGRESS - prev) * 0.22);
      });
    }, TRICKLE_INTERVAL_MS);

    safetyRef.current = setTimeout(() => {
      if (startedAtRef.current !== null) {
        reportRequestOutcome(Date.now() - startedAtRef.current, false);
        startedAtRef.current = null;
      }
      clearTimers();
      setIsVisible(false);
      setProgress(0);
    }, SAFETY_TIMEOUT_MS);
  }, [clearTimers]);

  const completeProgress = useCallback(() => {
    clearTimers();
    if (startedAtRef.current !== null) {
      reportRequestOutcome(Date.now() - startedAtRef.current, true);
      startedAtRef.current = null;
    }
    setProgress(100);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      timerRef.current = setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 180);
  }, [clearTimers]);

  // Whenever the path or search params change, navigation has successfully resolved.
  useEffect(() => {
    if (typeof document !== "undefined" && document.body.style.overflow === "hidden") {
      const hasVisibleModal = Boolean(document.querySelector("div[role='dialog']"));
      if (!hasVisibleModal) {
        document.body.style.overflow = "";
      }
    }

    if (!isVisible) return;

    const frameId = requestAnimationFrame(() => {
      completeProgress();
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, searchParams, isVisible, completeProgress]);

  // Intercept client-side navigation clicks and manual progress events.
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (shouldTriggerProgressForClick(e)) {
        startProgress();
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    const unsubManual = subscribeNavigationProgress((evt) => {
      if (evt === "start") startProgress();
      else completeProgress();
    });

    // Bubble phase ensures useOfflineGuard's e.preventDefault() runs first
    document.addEventListener("click", handleAnchorClick, false);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, false);
      window.removeEventListener("popstate", handlePopState);
      unsubManual();
      clearTimers();
    };
  }, [startProgress, completeProgress, clearTimers]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px] overflow-hidden bg-[var(--primary)]/15"
    >
      <div
        className="h-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)] transition-all duration-200"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
    </div>
  );
}

/**
 * Top-edge progress bar styled in Sporting Red (#e2001a) with slow-network trickle
 * and latency telemetry for degraded-connectivity detection.
 */
export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <TopProgressBarInner />
    </Suspense>
  );
}
