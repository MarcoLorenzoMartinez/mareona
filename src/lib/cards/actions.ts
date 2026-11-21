"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSyncedCardsCatalog } from "./card-catalog-sync";
import { getTodayDateString } from "./pack-storage";
import {
  reconcileAccountAlbumState,
  syncAlbumInputSchema,
  type AccountAlbumSnapshot,
} from "./account-sync";
import { readServerAlbumState, writeServerAlbumState } from "./account-state-store";
import {
  applyDailyGameClaimOnSnapshot,
  applyDailyLoginClaimOnSnapshot,
  applyOpenPackOnSnapshot,
  applyRecycleDuplicatesOnSnapshot,
  ensureInitialAlbumSnapshot,
} from "./album-server-domain";
import type { SyncedPorraPrediction } from "./account-games-sync";
import type { Card, PackTier } from "./types";

const packTierInputSchema = z.enum(["aficionado", "rojiblanco", "leyenda"]);

async function enrichWithPorraPredictions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  snapshot: AccountAlbumSnapshot
): Promise<AccountAlbumSnapshot> {
  const porraPredictions: Record<string, SyncedPorraPrediction> = {};
  try {
    const { data: predRows } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, sporting_scorers, updated_at")
      .eq("user_id", userId);

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
    ...snapshot,
    porraPredictions,
  };
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

    return await enrichWithPorraPredictions(supabase, user.id, reconciled);
  } catch {
    return null;
  }
}

/**
 * Authoritative Server Action that opens a booster pack from the user's server balance,
 * generates the cards on the server, and persists the updated account state.
 */
export async function openPackServerAction(rawTier: unknown): Promise<{
  readonly success: boolean;
  readonly error?: string;
  readonly cards?: readonly Card[];
  readonly duplicateSlugs?: readonly string[];
  readonly snapshot?: AccountAlbumSnapshot;
}> {
  const parsed = packTierInputSchema.safeParse(rawTier);
  if (!parsed.success) {
    return { success: false, error: "Tipo de sobre no válido." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Debes iniciar sesión para abrir sobres." };
    }

    const [current, allCards] = await Promise.all([
      readServerAlbumState(user.id),
      getSyncedCardsCatalog(supabase),
    ]);

    const base = ensureInitialAlbumSnapshot(current);
    const result = applyOpenPackOnSnapshot(base, parsed.data, allCards);
    if (!result.ok) {
      return {
        success: false,
        error:
          result.reason === "no_packs"
            ? "No te quedan sobres disponibles de este tipo."
            : "No se pudo cargar el catálogo de cromos.",
      };
    }

    await writeServerAlbumState(user.id, result.snapshot);
    return {
      success: true,
      cards: result.cards,
      duplicateSlugs: result.duplicateSlugs,
      snapshot: result.snapshot,
    };
  } catch {
    return { success: false, error: "No se pudo abrir el sobre en este momento." };
  }
}

/**
 * Authoritative Server Action to claim the daily login pack (1 Sobre Aficionado).
 */
export async function claimDailyLoginServerAction(): Promise<{
  readonly success: boolean;
  readonly tier?: PackTier;
  readonly snapshot?: AccountAlbumSnapshot;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const base = ensureInitialAlbumSnapshot(await readServerAlbumState(user.id));
    const result = applyDailyLoginClaimOnSnapshot(base, getTodayDateString());
    if (!result.ok) return { success: false };

    await writeServerAlbumState(user.id, result.snapshot);
    return { success: true, tier: result.tier, snapshot: result.snapshot };
  } catch {
    return { success: false };
  }
}

/**
 * Authoritative Server Action to claim the pending daily minigame pack reward.
 */
export async function claimDailyGameServerAction(): Promise<{
  readonly success: boolean;
  readonly tier?: PackTier;
  readonly streak?: number;
  readonly snapshot?: AccountAlbumSnapshot;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const base = ensureInitialAlbumSnapshot(await readServerAlbumState(user.id));
    const result = applyDailyGameClaimOnSnapshot(base, getTodayDateString());
    if (!result.ok) return { success: false };

    await writeServerAlbumState(user.id, result.snapshot);
    return {
      success: true,
      tier: result.tier,
      streak: result.streak,
      snapshot: result.snapshot,
    };
  } catch {
    return { success: false };
  }
}

/**
 * Authoritative Server Action to recycle 10 duplicate cards into 1 Sobre Rojiblanco.
 */
export async function recycleDuplicatesServerAction(): Promise<{
  readonly success: boolean;
  readonly snapshot?: AccountAlbumSnapshot;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const base = ensureInitialAlbumSnapshot(await readServerAlbumState(user.id));
    const result = applyRecycleDuplicatesOnSnapshot(base);
    if (!result.ok) return { success: false };

    await writeServerAlbumState(user.id, result.snapshot);
    return { success: true, snapshot: result.snapshot };
  } catch {
    return { success: false };
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
