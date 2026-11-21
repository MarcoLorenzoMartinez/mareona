"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";
import { DEFAULT_PACK_INVENTORY } from "./pack-storage";
import {
  accountAlbumSnapshotSchema,
  hasAlbumActivity,
  reconcileAccountAlbumState,
  syncAlbumInputSchema,
  type AccountAlbumSnapshot,
} from "./account-sync";
import type { SyncedPorraPrediction } from "./account-games-sync";

const ACCOUNT_CACHE_KEY_PREFIX = "user_account_state:";
const PERMANENT_CACHE_EXPIRY_ISO = "2099-12-31T23:59:59.000Z";

const persistSlugsInputSchema = z.array(z.string().regex(/^[a-z0-9-]+$/i)).max(600);

function getAccountCacheKey(userId: string): string {
  return `${ACCOUNT_CACHE_KEY_PREFIX}${userId}`;
}

/**
 * Reads the authoritative account album snapshot from Supabase (`user_account_state`
 * with seamless fallback to `external_api_cache` and `user_cards`).
 *
 * @param userId - Authenticated user UUID from server session.
 * @returns Parsed account snapshot or null if the user has never synced.
 */
async function readServerAlbumState(userId: string): Promise<AccountAlbumSnapshot | null> {
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
 * Persists the authoritative account album snapshot into Supabase.
 * Writes both to `user_account_state` and `external_api_cache` for zero-downtime resilience.
 *
 * @param userId - Authenticated user UUID from server session.
 * @param snapshot - Validated album state snapshot to persist.
 */
async function writeServerAlbumState(
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

/**
 * Reconciles or pushes the authenticated user's album, booster pack, and daily mission state
 * against Supabase so all devices logged into the same account see identical state.
 *
 * @param rawInput - Unvalidated client sync payload validated with Zod at the server boundary.
 * @returns Authoritative reconciled snapshot, or null if unauthenticated or invalid.
 */
export async function syncUserAlbumStateWithServer(
  rawInput: unknown
): Promise<AccountAlbumSnapshot | null> {
  const parsed = syncAlbumInputSchema.safeParse(rawInput);
  if (!parsed.success) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const currentServer = await readServerAlbumState(user.id);
    const reconciled = reconcileAccountAlbumState(
      currentServer,
      parsed.data.clientSnapshot,
      parsed.data.mode
    );

    if (
      !currentServer ||
      parsed.data.mode === "push" ||
      reconciled.revision !== currentServer.revision
    ) {
      await writeServerAlbumState(user.id, reconciled);
    }

    const porraPredictions: Record<string, SyncedPorraPrediction> = {};
    try {
      const { data: predRows } = await supabase
        .from("predictions")
        .select("match_id, home_score, away_score, sporting_scorers, updated_at")
        .eq("user_id", user.id);

      for (const row of predRows ?? []) {
        porraPredictions[row.match_id] = {
          matchId: row.match_id,
          homeScore: row.home_score,
          awayScore: row.away_score,
          sportingScorers: Array.isArray(row.sporting_scorers) ? row.sporting_scorers : [],
          submittedAt: row.updated_at,
        };
      }
    } catch {
      // Optional predictions enrichment fallback
    }

    return {
      ...reconciled,
      porraPredictions,
    };
  } catch {
    return null;
  }
}

/**
 * Loads the authenticated user's card quantities keyed by card slug from Supabase.
 */
export async function loadUserCardsFromServer(): Promise<Record<string, number> | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const state = await readServerAlbumState(user.id);
    return state ? state.cards : null;
  } catch {
    return null;
  }
}

/**
 * Persists newly acquired card slugs into the user's server account state.
 *
 * @param rawSlugs - Array of acquired card slugs validated with Zod.
 */
export async function persistAcquiredCardsToServer(
  rawSlugs: readonly string[]
): Promise<{ success: boolean }> {
  const parsed = persistSlugsInputSchema.safeParse(rawSlugs);
  if (!parsed.success || parsed.data.length === 0) {
    return { success: parsed.success };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const existing = await readServerAlbumState(user.id);
    const nextCards: Record<string, number> = { ...(existing?.cards ?? {}) };
    for (const slug of parsed.data) {
      nextCards[slug] = (nextCards[slug] ?? 0) + 1;
    }

    const nowIso = new Date().toISOString();
    const nextSnapshot: AccountAlbumSnapshot = {
      cards: nextCards,
      packs: existing?.packs ?? { ...DEFAULT_PACK_INVENTORY },
      missions: existing?.missions ?? {},
      hasActivity: hasAlbumActivity(nextCards, existing?.missions ?? {}),
      revision: (existing?.revision ?? 0) + 1,
      updatedAt: nowIso,
    };

    await writeServerAlbumState(user.id, nextSnapshot);
    return { success: true };
  } catch {
    return { success: false };
  }
}
