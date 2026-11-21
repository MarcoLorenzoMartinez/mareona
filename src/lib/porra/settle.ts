import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMatchDetail, fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import { evaluatePorraPrediction } from "./engine";
import type { PorraMatch } from "./types";

const ON_DEMAND_COOLDOWN_MS = 3 * 60 * 1000;
let lastSettledAttemptAt = 0;
let inflightSettlement: Promise<number> | null = null;

async function runSettlement(): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const { data: unsettled, error } = await admin
    .from("predictions")
    .select("id, user_id, match_id, home_score, away_score, sporting_scorers, created_at")
    .is("points_awarded", null)
    .limit(500);

  if (error || !unsettled || unsettled.length === 0) {
    return 0;
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
  if (matchIdsNeeded.length === 0) {
    return 0;
  }

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

  return settledCount;
}

/**
 * Settles pending La Porra predictions (`points_awarded IS NULL`) for finished matches
 * using official server-side sports data and `apply_prediction_points`.
 *
 * @param options.respectCooldown - Throttles on-demand triggers from page loads (3 min window).
 * @returns Number of predictions settled in this run.
 */
export async function settlePendingPredictions(
  options: { readonly respectCooldown?: boolean } = {}
): Promise<number> {
  if (inflightSettlement) {
    return inflightSettlement;
  }

  const now = Date.now();
  if (options.respectCooldown && now - lastSettledAttemptAt < ON_DEMAND_COOLDOWN_MS) {
    return 0;
  }

  lastSettledAttemptAt = now;
  inflightSettlement = runSettlement().finally(() => {
    inflightSettlement = null;
  });

  return inflightSettlement;
}
