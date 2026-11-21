import { NextResponse, type NextRequest } from "next/server";
import { settlePendingPredictions } from "@/lib/porra/settle";

/**
 * Automated settlement cron endpoint for La Porra (`public.predictions`).
 * Supports `GET` (Vercel Cron) and `POST` (manual/external trigger), protected by `CRON_SECRET`.
 */
async function handleSettle(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const settled = await settlePendingPredictions({ respectCooldown: false });
  return NextResponse.json({ ok: true, settled });
}

export async function GET(request: NextRequest) {
  return handleSettle(request);
}

export async function POST(request: NextRequest) {
  return handleSettle(request);
}
