/**
 * Client-side silent error dispatcher.
 * Submits unhandled errors caught by React ErrorBoundaries to the server log endpoint.
 * Always catches internal errors to guarantee the fallback UI remains stable.
 *
 * @param error - The caught runtime exception.
 */
export function reportClientError(error: Error & { digest?: string }): void {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      name: error.name || "Error",
      message: error.message || "Unknown error",
      digest: error.digest,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });

    // Prefer sendBeacon for non-blocking telemetry delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/client-errors", blob);
    } else {
      fetch("/api/client-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently swallow fetch errors
      });
    }
  } catch {
    // Silently ignore telemetry failure to prevent crashing error page
  }
}
