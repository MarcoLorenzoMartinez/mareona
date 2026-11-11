// Client: Anonymous, cookieless telemetry client using navigator.sendBeacon
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "mareona_telemetry_sid";

function getOrCreateSessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "session_fallback";
  }
}

function detectIsPwa(): boolean {
  if (typeof window === "undefined") return false;
  const isStandaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone = "standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone);
  return isStandaloneMatch || isIosStandalone;
}

function detectDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "mobile";
  const isSmallScreen = window.innerWidth <= 768;
  const isMobileUa = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  return isSmallScreen || isMobileUa ? "mobile" : "desktop";
}

function sendTelemetryPing(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(payload);
  const endpoint = "/api/telemetry";

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) return;
  }

  // Fallback if sendBeacon fails or is unsupported
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Suppress telemetry network errors
  });
}

/**
 * Lightweight beacon tracking route changes without cookies, fingerprinting or third-party scripts.
 */
export function TelemetryBeacon() {
  const pathname = usePathname();
  const pageStartRef = useRef<number>(0);
  const lastPathnameRef = useRef<string>("");

  useEffect(() => {
    const isPwa = detectIsPwa();
    const deviceType = detectDeviceType();
    const sessionId = getOrCreateSessionId();

    if (pageStartRef.current === 0) {
      pageStartRef.current = Date.now();
      lastPathnameRef.current = pathname;
    }

    // If pathname changed, flush duration of previous page
    if (lastPathnameRef.current && lastPathnameRef.current !== pathname) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - pageStartRef.current) / 1000));
      sendTelemetryPing({
        pathname: lastPathnameRef.current,
        deviceType,
        isPwa,
        sessionId,
        durationSeconds: Math.min(elapsedSeconds, 3600),
      });
    }

    // Record entry to the new page
    lastPathnameRef.current = pathname;
    pageStartRef.current = Date.now();

    sendTelemetryPing({
      pathname,
      deviceType,
      isPwa,
      sessionId,
      durationSeconds: 0,
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const elapsed = Math.max(1, Math.round((Date.now() - pageStartRef.current) / 1000));
        sendTelemetryPing({
          pathname: lastPathnameRef.current,
          deviceType,
          isPwa,
          sessionId,
          durationSeconds: Math.min(elapsed, 3600),
        });
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
