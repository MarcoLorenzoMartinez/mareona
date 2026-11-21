import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";
import {
  accountAlbumSnapshotSchema,
  type AccountAlbumSnapshot,
} from "./account-sync";

const ACCOUNT_CACHE_KEY_PREFIX = "user_account_state:";
const PERMANENT_CACHE_EXPIRY_ISO = "2099-12-31T23:59:59.000Z";

function getAccountCacheKey(userId: string): string {
  return `${ACCOUNT_CACHE_KEY_PREFIX}${userId}`;
}

/**
 * Reads the authoritative account album snapshot from Supabase (`user_account_state`
 * with fallback to `external_api_cache`).
 *
 * @param userId - Authenticated user UUID from server session.
 * @returns Parsed account snapshot or null if the user has never synced.
 */
export async function readServerAlbumState(
  userId: string
): Promise<AccountAlbumSnapshot | null> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const db = admin ?? supabase;

  let tableSnapshot: AccountAlbumSnapshot | null = null;
  let cacheSnapshot: AccountAlbumSnapshot | null = null;

  try {
    const { data: row } = await db
      .from("user_account_state")
      .select("cards, packs, missions, has_activity, revision, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (row) {
      const candidate = accountAlbumSnapshotSchema.safeParse({
        cards: row.cards,
        packs: row.packs,
        missions: row.missions,
        hasActivity: row.has_activity,
        revision: row.revision,
        updatedAt: row.updated_at,
      });
      if (candidate.success) {
        tableSnapshot = candidate.data;
      }
    }
  } catch {
    // Table may not be migrated yet in remote environment; fallback to cache below
  }

  try {
    const { data: cacheRow } = await db
      .from("external_api_cache")
      .select("payload")
      .eq("cache_key", getAccountCacheKey(userId))
      .maybeSingle();

    if (cacheRow?.payload) {
      const candidate = accountAlbumSnapshotSchema.safeParse(cacheRow.payload);
      if (candidate.success) {
        cacheSnapshot = candidate.data;
      }
    }
  } catch {
    // Fallback silent catch
  }

  if (tableSnapshot && cacheSnapshot) {
    return tableSnapshot.revision >= cacheSnapshot.revision ? tableSnapshot : cacheSnapshot;
  }
  return tableSnapshot ?? cacheSnapshot;
}

/**
 * Persists the authoritative account album snapshot into Supabase (`user_account_state`
 * and `external_api_cache`).
 *
 * @param userId - Authenticated user UUID from server session.
 * @param snapshot - Validated album state snapshot to persist.
 */
export async function writeServerAlbumState(
  userId: string,
  snapshot: AccountAlbumSnapshot
): Promise<void> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const db = admin ?? supabase;
  const payloadJson = snapshot as unknown as Json;

  try {
    await db.from("user_account_state").upsert(
      {
        user_id: userId,
        cards: snapshot.cards as unknown as Json,
        packs: snapshot.packs as unknown as Json,
        missions: snapshot.missions as unknown as Json,
        has_activity: snapshot.hasActivity,
        revision: snapshot.revision,
        updated_at: snapshot.updatedAt,
      },
      { onConflict: "user_id" }
    );
  } catch {
    // Handled by external_api_cache write below when table migration is pending
  }

  if (admin) {
    try {
      await admin.from("external_api_cache").upsert(
        {
          cache_key: getAccountCacheKey(userId),
          payload: payloadJson,
          fetched_at: snapshot.updatedAt,
          expires_at: PERMANENT_CACHE_EXPIRY_ISO,
        },
        { onConflict: "cache_key" }
      );
    } catch {
      // Cache persistence fallback
    }
  }
}
