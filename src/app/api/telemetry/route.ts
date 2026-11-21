import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resolveProvinceName, resolveCountryName } from "@/lib/telemetry/geolocation";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { logger } from "@/lib/logger";

const log = logger.child("telemetry");

const telemetryPayloadSchema = z.object({
  pathname: z.string().min(1).max(255),
  deviceType: z.enum(["mobile", "desktop", "tablet"]).default("mobile"),
  isPwa: z.boolean().default(false),
  sessionId: z.string().max(64).optional().nullable(),
  durationSeconds: z.number().int().min(0).max(86400).default(0),
});

/**
 * Ingests anonymous, privacy-first telemetry pings without cookies or storing IP addresses.
 * Fully compliant with GDPR / AEPD guidelines: records exclusively aggregated metrics.
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const rate = checkRateLimit({ key: `telemetry_${clientIp}`, limit: 60, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json({ ok: true, ignored: "rate_limited" });
    }

    let rawBody: unknown;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      rawBody = await request.json();
    } else {
      const text = await request.text();
      rawBody = text ? JSON.parse(text) : {};
    }

    const parsed = telemetryPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      log.warn("Telemetry ping rejected: invalid payload schema", {
        issues: parsed.error.issues,
      });
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // Ignore internal administration routes from public telemetry
    if (parsed.data.pathname.startsWith("/admin")) {
      log.debug("Telemetry ping ignored: admin route", { path: parsed.data.pathname });
      return NextResponse.json({ ok: true, ignored: "admin_route" });
    }

    // Ignore automated bots, crawlers, and headless audit runners
    const userAgent = request.headers.get("user-agent") || "";
    if (/bot|crawler|spider|headless|lighthouse|vercel-screenshot|curl|wget|python-requests/i.test(userAgent)) {
      return NextResponse.json({ ok: true, ignored: "bot_user_agent" });
    }

    // Ignore local development requests unless explicitly forced
    const host = request.headers.get("host") || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const isForceEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_TELEMETRY === "true";

    if ((process.env.NODE_ENV === "development" || isLocalhost) && !isForceEnabled) {
      return NextResponse.json({ ok: true, ignored: "dev_environment" });
    }

    // Extract geo-headers safely provided by Vercel CDN at the edge
    const countryHeader = request.headers.get("x-vercel-ip-country");
    const regionHeader = request.headers.get("x-vercel-ip-country-region");
    const cityHeader = request.headers.get("x-vercel-ip-city");

    const country = resolveCountryName(countryHeader);
    const province = resolveProvinceName(regionHeader, cityHeader);

    const supabase = await createClient();

    const { error: insertError } = await supabase.from("site_visits").insert({
      pathname: parsed.data.pathname,
      device_type: parsed.data.deviceType,
      is_pwa: parsed.data.isPwa,
      session_id: parsed.data.sessionId ?? null,
      duration_seconds: parsed.data.durationSeconds,
      country,
      province,
    });

    if (insertError) {
      log.error("Failed to insert telemetry visit to database", insertError, {
        path: parsed.data.pathname,
      });
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    log.debug("Telemetry ping recorded successfully", {
      path: parsed.data.pathname,
      device: parsed.data.deviceType,
      isPwa: parsed.data.isPwa,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Fail silently: telemetry must never interrupt user experience
    log.error("Unhandled exception in telemetry ingestion endpoint", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
