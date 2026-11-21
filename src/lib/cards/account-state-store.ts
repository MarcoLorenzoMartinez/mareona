import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLogger } from "@/lib/logger/core";
import type { Json } from "@/types/database.types";
import {
  accountAlbumSnapshotSchema,
  type AccountAlbumSnapshot,
} from "./account-sync";

const accountStoreLog = createLogger({ context: "account-state-store" });

/**
 * Reads the authoritative account album snapshot from `public.user_account_state`.
 * Private user data is never stored in or read from public cache tables.
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

  try {
    const { data: row, error } = await db
      .from("user_account_state")
      .select("cards, packs, missions, storage_entries, has_activity, revision, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      accountStoreLog.warn("Failed to read user_account_state", { code: error.code });
      return null;
    }

    if (!row) return null;

    const candidate = accountAlbumSnapshotSchema.safeParse({
      cards: row.cards,
      packs: row.packs,
      missions: row.missions,
      storageEntries: row.storage_entries ?? {},
      hasActivity: row.has_activity,
      revision: row.revision,
      updatedAt: row.updated_at,
    });

    if (!candidate.success) {
      accountStoreLog.warn("Invalid user_account_state snapshot shape");
      return null;
    }

    return candidate.data;
  } catch (err) {
    accountStoreLog.error("Unexpected error reading user_account_state", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return null;
  }
}

/**
 * Persists the authoritative account album snapshot strictly into `public.user_account_state`
 * via the privileged server `service_role` client.
 *
 * @param userId - Authenticated user UUID from server session.
 * @param snapshot - Validated album state snapshot to persist.
 * @throws Error if `SUPABASE_SERVICE_ROLE_KEY` is missing or Supabase returns a write error.
 */
export async function writeServerAlbumState(
  userId: string,
  snapshot: AccountAlbumSnapshot
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    accountStoreLog.error("Missing service role client when persisting user_account_state");
    throw new Error("El servicio de sincronización de cuenta no está configurado en servidor.");
  }

  const { error } = await admin.from("user_account_state").upsert(
    {
      user_id: userId,
      cards: snapshot.cards as unknown as Json,
      packs: snapshot.packs as unknown as Json,
      missions: snapshot.missions as unknown as Json,
      storage_entries: (snapshot.storageEntries ?? {}) as unknown as Json,
      has_activity: snapshot.hasActivity,
      revision: snapshot.revision,
      updated_at: snapshot.updatedAt,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    accountStoreLog.error("Failed to upsert user_account_state", { code: error.code });
    throw new Error(`No se pudo guardar el estado de la cuenta (${error.code ?? "db_error"}).`);
  }
}
