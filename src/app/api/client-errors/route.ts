import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
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
