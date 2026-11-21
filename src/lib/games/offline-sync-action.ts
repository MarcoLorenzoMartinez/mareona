"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { readServerAlbumState, writeServerAlbumState } from "@/lib/cards/account-state-store";
import {
  applyDailyGameWinOnSnapshot,
  ensureInitialAlbumSnapshot,
} from "@/lib/cards/album-server-domain";
import { getTodayDateString } from "@/lib/cards/pack-storage";
import {
  syncOfflineGamesInputSchema,
  type SyncOfflineGamesInput,
} from "./offline-sync-types";

export interface SyncActionResult {
  readonly success: boolean;
  readonly syncedIds: readonly string[];
  readonly awardedReward?: boolean;
}

/**
 * Synchronizes queued offline game attempts to the server for an authenticated user.
 * Requires a valid Supabase session so guest queues are preserved until sign-in,
 * and records eligible daily game wins into `user_account_state`.
 *
 * @param rawInput - Validated batch of queued game events.
 * @returns Sync result with acknowledged event IDs.
 */
export async function syncOfflineGamesAction(
  rawInput: SyncOfflineGamesInput
): Promise<SyncActionResult> {
  const parsed = syncOfflineGamesInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, syncedIds: [] };
  }

  const { events } = parsed.data;
  if (events.length === 0) {
    return { success: true, syncedIds: [] };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Preserve offline queue if the user is not authenticated yet
    if (authError || !user) {
      return { success: false, syncedIds: [] };
    }

    const today = getTodayDateString();
    const hasTodayWin = events.some((ev) => ev.won && ev.challengeDate === today);

    let awardedReward = false;
    if (hasTodayWin) {
      const base = ensureInitialAlbumSnapshot(await readServerAlbumState(user.id));
      const outcome = applyDailyGameWinOnSnapshot(base, today);
      if (outcome.awarded) {
        await writeServerAlbumState(user.id, outcome.snapshot);
        awardedReward = true;
      }
    }

    return {
      success: true,
      syncedIds: events.map((e) => e.id),
      awardedReward,
    };
  } catch {
    return {
      success: false,
      syncedIds: [],
    };
  }
}
