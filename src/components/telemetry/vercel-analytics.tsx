// Client: Wraps @vercel/analytics to provide the client-side beforeSend filter
"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Excludes internal administration routes from Vercel Web Analytics
 * so staff visits do not inflate public traffic metrics.
 */
function filterAdminRoutes(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const pathname = new URL(event.url).pathname;
    if (pathname.startsWith("/admin")) {
      return null;
    }
  } catch {
    if (event.url.includes("/admin")) {
      return null;
    }
  }
  return event;
}

/**
 * Privacy-first, cookieless Vercel Web Analytics integration.
 */
export function VercelAnalytics() {
  return <Analytics beforeSend={filterAdminRoutes} />;
}
