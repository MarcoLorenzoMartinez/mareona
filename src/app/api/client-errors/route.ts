import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import {
  clientErrorReportSchema,
  formatClientErrorForLog,
} from "@/lib/telemetry/client-error-schema";

/**
 * Ingestion endpoint for client-side React error boundaries.
 * Records fatal frontend crashes to structured server logs for operational visibility.
 */
export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const rate = checkRateLimit({ key: `client_errors_${clientIp}`, limit: 20, windowMs: 60_000 });
    if (!rate.allowed) {
      return new NextResponse(null, { status: 429 });
    }

    const rawBody: unknown = await request.json();
    const parsed = clientErrorReportSchema.safeParse(rawBody);

    if (!parsed.success) {
      return new NextResponse(null, { status: 400 });
    }

    const metadata = formatClientErrorForLog(parsed.data);

    logger.error("Client ErrorBoundary caught fatal runtime exception", undefined, {
      ...metadata,
      source: "client_error_boundary",
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logger.warn("Failed to process client error report", {
      reason: err instanceof Error ? err.message : "unknown",
    });
    return new NextResponse(null, { status: 204 });
  }
}
