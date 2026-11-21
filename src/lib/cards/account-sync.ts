import { z } from "zod";
import type { UserPackInventory } from "./types.ts";
import {
  DEFAULT_PACK_INVENTORY,
  migrateCardInventorySlugs,
  type StoredMissionState,
} from "./pack-storage.ts";
import {
  mergeSyncedGameStorageEntries,
  syncedGameStorageMapSchema,
  syncedPorraPredictionsMapSchema,
} from "./account-games-sync.ts";

export const ALBUM_SYNC_REVISION_KEY = "mareona_album_sync_rev_v1";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const packInventorySchema = z.object({
  aficionado: z.number().int().min(0).max(9999),
  rojiblanco: z.number().int().min(0).max(9999),
  leyenda: z.number().int().min(0).max(9999),
});

export const storedMissionStateSchema = z.object({
  lastLoginClaimDate: z.string().regex(isoDateRegex).optional(),
  lastGameWinDate: z.string().regex(isoDateRegex).optional(),
  lastGameClaimDate: z.string().regex(isoDateRegex).optional(),
  gameStreak: z.number().int().min(0).max(3650).optional(),
  pendingGameRewardTier: z.enum(["aficionado", "rojiblanco", "leyenda"]).optional(),
});

export const cardInventoryMapSchema = z.record(
  z.string().regex(/^[a-z0-9-]+$/i),
  z.number().int().min(0).max(9999)
);

export const accountAlbumSnapshotSchema = z.object({
  cards: cardInventoryMapSchema,
  packs: packInventorySchema,
  missions: storedMissionStateSchema,
  storageEntries: syncedGameStorageMapSchema,
  porraPredictions: syncedPorraPredictionsMapSchema,
  hasActivity: z.boolean(),
  revision: z.number().int().min(0),
  updatedAt: z.string(),
});

export const syncAlbumInputSchema = z.object({
  mode: z.enum(["reconcile", "push"]),
  clientSnapshot: accountAlbumSnapshotSchema,
});

export type AccountAlbumSnapshot = z.infer<typeof accountAlbumSnapshotSchema>;
export type SyncAlbumInput = z.infer<typeof syncAlbumInputSchema>;

/**
 * Checks whether a snapshot contains real gameplay activity (opened cards or claimed/won missions).
 */
export function hasAlbumActivity(
  cards: Readonly<Record<string, number>>,
  missions: StoredMissionState
): boolean {
  const hasOwnedCards = Object.values(cards).some((qty) => qty > 0);
  const hasMissionHistory = Boolean(
    missions.lastLoginClaimDate || missions.lastGameWinDate || missions.lastGameClaimDate
  );
  return hasOwnedCards || hasMissionHistory;
}

/**
 * Merges two mission state records, preserving the latest completion and claim dates across devices.
 */
export function mergeMissionStates(
  server: StoredMissionState,
  client: StoredMissionState
): StoredMissionState {
  const maxDate = (a?: string, b?: string): string | undefined => {
    if (!a) return b;
    if (!b) return a;
    return a >= b ? a : b;
  };

  const lastLoginClaimDate = maxDate(server.lastLoginClaimDate, client.lastLoginClaimDate);
  const lastGameWinDate = maxDate(server.lastGameWinDate, client.lastGameWinDate);
  const lastGameClaimDate = maxDate(server.lastGameClaimDate, client.lastGameClaimDate);

  const serverWin = server.lastGameWinDate ?? server.lastGameClaimDate ?? "";
  const clientWin = client.lastGameWinDate ?? client.lastGameClaimDate ?? "";

  const gameStreak =
    clientWin > serverWin
      ? (client.gameStreak ?? 0)
      : serverWin > clientWin
        ? (server.gameStreak ?? 0)
        : Math.max(server.gameStreak ?? 0, client.gameStreak ?? 0);

  const isGameRewardPending = Boolean(lastGameWinDate && lastGameWinDate !== lastGameClaimDate);
  const pendingGameRewardTier = isGameRewardPending
    ? (client.pendingGameRewardTier ?? server.pendingGameRewardTier)
    : undefined;

  return {
    ...(lastLoginClaimDate ? { lastLoginClaimDate } : {}),
    ...(lastGameWinDate ? { lastGameWinDate } : {}),
    ...(lastGameClaimDate ? { lastGameClaimDate } : {}),
    ...(gameStreak > 0 ? { gameStreak } : {}),
    ...(pendingGameRewardTier ? { pendingGameRewardTier } : {}),
  };
}

/**
 * Reconciles server and client account snapshots so all logged-in devices converge to identical state.
 */
export function reconcileAccountAlbumState(
  server: AccountAlbumSnapshot | null,
  client: AccountAlbumSnapshot,
  mode: "reconcile" | "push",
  nowIso = new Date().toISOString()
): AccountAlbumSnapshot {
  const { inventory: clientCards } = migrateCardInventorySlugs(client.cards);
  const mergedStorage = mergeSyncedGameStorageEntries(server?.storageEntries, client.storageEntries, mode);
  const clientActive =
    client.hasActivity ||
    hasAlbumActivity(clientCards, client.missions) ||
    Object.keys(client.storageEntries ?? {}).length > 0;

  if (!server) {
    return {
      cards: clientCards,
      packs: client.packs,
      missions: client.missions,
      storageEntries: mergedStorage,
      hasActivity: mode === "push" ? true : clientActive,
      revision: Math.max(1, client.revision),
      updatedAt: nowIso,
    };
  }

  const { inventory: serverCards } = migrateCardInventorySlugs(server.cards);
  const serverActive = server.hasActivity || hasAlbumActivity(serverCards, server.missions);
  const mergedMissions = mergeMissionStates(server.missions, client.missions);

  if (mode === "push") {
    const nextCards: Record<string, number> = { ...clientCards };
    for (const [slug, qty] of Object.entries(serverCards)) {
      if (!(slug in nextCards) && qty > 0) nextCards[slug] = qty;
    }
    return {
      cards: nextCards,
      packs: client.packs,
      missions: mergedMissions,
      storageEntries: mergedStorage,
      hasActivity: true,
      revision: Math.max(server.revision, client.revision) + 1,
      updatedAt: nowIso,
    };
  }

  if (client.revision > 0) {
    const missionsChanged = JSON.stringify(mergedMissions) !== JSON.stringify(server.missions);
    const storageChanged = JSON.stringify(mergedStorage) !== JSON.stringify(server.storageEntries ?? {});
    const changed = missionsChanged || storageChanged;
    return {
      cards: serverCards,
      packs: server.packs,
      missions: mergedMissions,
      storageEntries: mergedStorage,
      hasActivity: serverActive || clientActive,
      revision: changed ? server.revision + 1 : server.revision,
      updatedAt: changed ? nowIso : server.updatedAt,
    };
  }

  const mergedCards: Record<string, number> = { ...serverCards };
  for (const [slug, qty] of Object.entries(clientCards)) {
    if (qty > (mergedCards[slug] ?? 0)) mergedCards[slug] = qty;
  }

  let resolvedPacks: UserPackInventory = server.packs;
  if (!serverActive && clientActive) {
    resolvedPacks = client.packs;
  } else if (serverActive && clientActive) {
    const sTotal = Object.values(serverCards).reduce((a, b) => a + b, 0);
    const cTotal = Object.values(clientCards).reduce((a, b) => a + b, 0);
    if (cTotal > sTotal) resolvedPacks = client.packs;
  }

  return {
    cards: mergedCards,
    packs: resolvedPacks,
    missions: mergedMissions,
    storageEntries: mergedStorage,
    hasActivity: serverActive || clientActive,
    revision: server.revision + 1,
    updatedAt: nowIso,
  };
}

/**
 * Server-authoritative reconciliation boundary used by Server Actions.
 * Never allows a client payload (neither on initial sync nor via `mode: "push"`) to forge or
 * overwrite sensitive inventory (`cards`, `packs`, `missions`). Only client game storage entries
 * (Wordle, Who Are Ya, Lineup Builder, etc.) are synchronized across devices.
 *
 * @param server - Current authoritative server snapshot (or null on first sync).
 * @param client - Untrusted client snapshot validated by Zod.
 * @param storageSyncMode - Cross-device merge mode applied strictly to non-privileged `storageEntries`.
 * @param nowIso - Timestamp ISO string.
 * @returns Server-authoritative reconciled snapshot.
 */
export function reconcileAuthoritativeAccountState(
  server: AccountAlbumSnapshot | null,
  client: AccountAlbumSnapshot,
  storageSyncMode: "reconcile" | "push",
  nowIso = new Date().toISOString()
): AccountAlbumSnapshot {
  const mergedStorage = mergeSyncedGameStorageEntries(
    server?.storageEntries,
    client.storageEntries,
    storageSyncMode
  );

  // Preserve server-owned claimed Porra rewards key so clients cannot erase claim records
  const serverClaimedPorra = server?.storageEntries?.mareona_porra_claimed_rewards_v1;
  if (serverClaimedPorra !== undefined) {
    mergedStorage.mareona_porra_claimed_rewards_v1 = serverClaimedPorra;
  }

  if (!server) {
    return {
      cards: {},
      packs: { ...DEFAULT_PACK_INVENTORY },
      missions: {},
      storageEntries: mergedStorage,
      hasActivity: Object.keys(mergedStorage).length > 0,
      revision: 1,
      updatedAt: nowIso,
    };
  }

  const { inventory: serverCards } = migrateCardInventorySlugs(server.cards);
  const serverActive = server.hasActivity || hasAlbumActivity(serverCards, server.missions);
  const storageChanged =
    JSON.stringify(mergedStorage) !== JSON.stringify(server.storageEntries ?? {});

  return {
    cards: serverCards,
    packs: server.packs,
    missions: server.missions,
    storageEntries: mergedStorage,
    hasActivity: serverActive || Object.keys(mergedStorage).length > 0,
    revision: storageChanged ? server.revision + 1 : server.revision,
    updatedAt: storageChanged ? nowIso : server.updatedAt,
  };
}
