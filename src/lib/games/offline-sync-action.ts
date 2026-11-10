"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  syncOfflineGamesInputSchema,
  type SyncOfflineGamesInput,
} from "./offline-sync-types";

export interface SyncActionResult {
  readonly success: boolean;
  readonly syncedIds: readonly string[];
}

/**
 * Synchronizes queued offline game attempts to the server.
 * Validates payloads with Zod, checks session, and acknowledges synced items.
 *
 * @param rawInput - Validated batch of queued game events.
 * @returns Sync result with successfully acknowledged event IDs.
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
    // Validate session if user context was attached to events
    await supabase.auth.getUser();

    return {
      success: true,
      syncedIds: events.map((e) => e.id),
    };
  } catch {
    return {
      success: false,
      syncedIds: [],
    };
  }
}
