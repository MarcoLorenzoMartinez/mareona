import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types.ts";
import type { Card } from "./types.ts";
import type { DomainMatchDetail } from "../sports-api/types.ts";
import { HISTORICAL_CARDS_SEED } from "./seed-data.ts";
import { syncFinishedMatchesWithSupabase } from "./sync-matches.ts";

/**
 * Baseline cutoff date (ISO 8601). All official matches played on or before this date
 * (up to 2026-27 Jornada 13 and Copa del Rey Round 1) are already consolidated in
 * the static card catalog (`players-2016-present.ts`). Only matches after this timestamp
 * dynamically increment `matchesPlayed` via `card_match_sync`.
 */
export const CARD_CATALOG_BASELINE_CUTOFF_ISO = "2026-11-12T00:00:00Z";

/**
 * Returns complete card catalog with all dynamic match appearance increments applied
 * from verified finished matches played after the static baseline cutoff.
 */
export async function getSyncedCardsCatalog(
  supabase?: SupabaseClient<Database> | null
): Promise<readonly Card[]> {
  if (!supabase) return HISTORICAL_CARDS_SEED;

  try {
    const { data: syncRows } = await supabase
      .from("card_match_sync")
      .select("synced_card_slugs, match_date")
      .gt("match_date", CARD_CATALOG_BASELINE_CUTOFF_ISO);

    if (!syncRows || syncRows.length === 0) return HISTORICAL_CARDS_SEED;

    const counts: Record<string, number> = {};
    for (const row of syncRows) {
      if (!Array.isArray(row.synced_card_slugs)) continue;
      for (const slug of row.synced_card_slugs) {
        counts[slug] = (counts[slug] ?? 0) + 1;
      }
    }

    return HISTORICAL_CARDS_SEED.map((c) => {
      const increment = counts[c.slug];
      if (!increment) return c;
      return {
        ...c,
        matchesPlayed: (c.matchesPlayed ?? 0) + increment,
      };
    });
  } catch {
    return HISTORICAL_CARDS_SEED;
  }
}

/**
 * Automatically triggers card match synchronization for a newly finished match
 * played after the static catalog baseline cutoff.
 * Runs non-blocking to prevent holding up match detail retrieval or live updates.
 */
export async function triggerCardSyncForFinishedMatch(
  supabase: SupabaseClient<Database>,
  match: DomainMatchDetail
): Promise<void> {
  if (match.status !== "finished") return;
  if (!match.kickoffAt || match.kickoffAt <= CARD_CATALOG_BASELINE_CUTOFF_ISO) {
    return;
  }
  try {
    await syncFinishedMatchesWithSupabase(supabase, [match]);
  } catch {
    // Fail-safe: sync failure does not break the match detail user experience
  }
}
