import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMatchDetail, fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import { evaluatePorraPrediction } from "@/lib/porra/engine";
import type { PorraMatch } from "@/lib/porra/types";

/**
 * Automated settlement cron endpoint for La Porra (`public.predictions`).
 * Protected by `CRON_SECRET` Bearer token.
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin client unavailable" }, { status: 500 });
  }

  const { data: unsettled, error } = await admin
    .from("predictions")
    .select("id, user_id, match_id, home_score, away_score, sporting_scorers, created_at")
    .is("points_awarded", null)
    .limit(500);

  if (error || !unsettled || unsettled.length === 0) {
    return NextResponse.json({ ok: true, settled: 0 });
  }

  const seasonMatches = await fetchSportingSeasonMatches();
  const finishedById = new Map(
    seasonMatches
      .filter((m) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null)
      .map((m) => [m.externalId, m])
  );

  const matchIdsNeeded = Array.from(
    new Set(unsettled.map((u) => u.match_id).filter((id) => finishedById.has(id)))
  );

  const porraMatchById = new Map<string, PorraMatch>();
  for (const matchId of matchIdsNeeded) {
    const summary = finishedById.get(matchId);
    if (!summary) continue;
    const detail = await fetchMatchDetail(matchId);
    if (!detail) continue;

    const actualSportingScorers = detail.events
      .filter((ev) => ev.type === "goal" && ev.isSporting)
      .map((ev) => ev.player.name);

    porraMatchById.set(matchId, {
      id: summary.externalId,
      roundName: summary.competition,
      matchday: summary.matchday ?? undefined,
      homeTeam: {
        name: summary.homeTeam.name,
        crestUrl: summary.homeTeam.crestUrl ?? undefined,
        isSporting: summary.homeTeam.isSporting,
      },
      awayTeam: {
        name: summary.awayTeam.name,
        crestUrl: summary.awayTeam.crestUrl ?? undefined,
        isSporting: summary.awayTeam.isSporting,
      },
      kickoffAt: summary.kickoffAt,
      isFinished: true,
      actualHomeScore: summary.homeScore ?? 0,
      actualAwayScore: summary.awayScore ?? 0,
      actualSportingScorers,
    });
  }

  let settledCount = 0;
  for (const row of unsettled) {
    const match = porraMatchById.get(row.match_id);
    if (!match) continue;

    const evaluation = evaluatePorraPrediction(
      {
        matchId: row.match_id,
        homeScore: row.home_score,
        awayScore: row.away_score,
        sportingScorers: Array.isArray(row.sporting_scorers) ? row.sporting_scorers : [],
        submittedAt: row.created_at,
      },
      match
    );

    const { error: rpcErr } = await admin.rpc("apply_prediction_points", {
      p_prediction_id: row.id,
      p_points: evaluation.points,
    });
    if (!rpcErr) settledCount += 1;
  }

  return NextResponse.json({ ok: true, settled: settledCount });
}
