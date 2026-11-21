import { generatePackCards } from "./packs.ts";
import {
  DEFAULT_PACK_INVENTORY,
  DUPLICATES_RECIPE_COST,
  computeActiveGameStreak,
  resolveStreakRewardTier,
} from "./pack-storage.ts";
import { hasAlbumActivity, type AccountAlbumSnapshot } from "./account-sync.ts";
import type { Card, PackTier } from "./types.ts";

/**
 * Ensures an account snapshot exists, initializing default welcome packs when null.
 */
export function ensureInitialAlbumSnapshot(
  snapshot: AccountAlbumSnapshot | null,
  nowIso = new Date().toISOString()
): AccountAlbumSnapshot {
  if (snapshot) return snapshot;
  return {
    cards: {},
    packs: { ...DEFAULT_PACK_INVENTORY },
    missions: {},
    hasActivity: false,
    revision: 1,
    updatedAt: nowIso,
  };
}

/**
 * Server-side pack opening transition: checks pack balance, generates cards, updates inventory.
 */
export function applyOpenPackOnSnapshot(
  snapshot: AccountAlbumSnapshot,
  tier: PackTier,
  allCards: readonly Card[],
  nowIso = new Date().toISOString()
):
  | {
      readonly ok: true;
      readonly snapshot: AccountAlbumSnapshot;
      readonly cards: readonly Card[];
      readonly duplicateSlugs: readonly string[];
    }
  | { readonly ok: false; readonly reason: "no_packs" | "empty_catalog" } {
  if ((snapshot.packs[tier] ?? 0) <= 0) {
    return { ok: false, reason: "no_packs" };
  }
  if (allCards.length === 0) {
    return { ok: false, reason: "empty_catalog" };
  }

  const previouslyOwned = new Set(
    Object.entries(snapshot.cards)
      .filter(([, qty]) => qty > 0)
      .map(([slug]) => slug)
  );

  const generated = generatePackCards(tier, allCards, previouslyOwned);
  const duplicateSlugs: string[] = [];
  const seenInPack = new Set<string>();
  const nextCards: Record<string, number> = { ...snapshot.cards };

  for (const card of generated) {
    if (previouslyOwned.has(card.slug) || seenInPack.has(card.slug)) {
      if (!duplicateSlugs.includes(card.slug)) {
        duplicateSlugs.push(card.slug);
      }
    }
    seenInPack.add(card.slug);
    nextCards[card.slug] = (nextCards[card.slug] ?? 0) + 1;
  }

  const nextPacks = {
    ...snapshot.packs,
    [tier]: Math.max(0, snapshot.packs[tier] - 1),
  };

  return {
    ok: true,
    cards: generated,
    duplicateSlugs,
    snapshot: {
      ...snapshot,
      cards: nextCards,
      packs: nextPacks,
      hasActivity: true,
      revision: snapshot.revision + 1,
      updatedAt: nowIso,
    },
  };
}

/**
 * Server-side daily login pack claim (1 Sobre Aficionado per Europe/Madrid calendar day).
 */
export function applyDailyLoginClaimOnSnapshot(
  snapshot: AccountAlbumSnapshot,
  today: string,
  nowIso = new Date().toISOString()
):
  | { readonly ok: true; readonly snapshot: AccountAlbumSnapshot; readonly tier: PackTier }
  | { readonly ok: false; readonly reason: "already_claimed" } {
  if (snapshot.missions.lastLoginClaimDate === today) {
    return { ok: false, reason: "already_claimed" };
  }

  const tier: PackTier = "aficionado";
  const nextMissions = {
    ...snapshot.missions,
    lastLoginClaimDate: today,
  };

  return {
    ok: true,
    tier,
    snapshot: {
      ...snapshot,
      packs: {
        ...snapshot.packs,
        [tier]: (snapshot.packs[tier] ?? 0) + 1,
      },
      missions: nextMissions,
      hasActivity: hasAlbumActivity(snapshot.cards, nextMissions) || snapshot.hasActivity,
      revision: snapshot.revision + 1,
      updatedAt: nowIso,
    },
  };
}

/**
 * Server-side daily minigame win recording with automatic streak and pending reward handling.
 */
export function applyDailyGameWinOnSnapshot(
  snapshot: AccountAlbumSnapshot,
  today: string,
  nowIso = new Date().toISOString()
): {
  readonly awarded: boolean;
  readonly snapshot: AccountAlbumSnapshot;
  readonly tier?: PackTier;
  readonly streak?: number;
} {
  const effectiveWinDate =
    snapshot.missions.lastGameWinDate ?? snapshot.missions.lastGameClaimDate;
  if (effectiveWinDate === today) {
    return { awarded: false, snapshot };
  }

  const nextPacks = { ...snapshot.packs };
  if (
    snapshot.missions.pendingGameRewardTier &&
    snapshot.missions.lastGameWinDate &&
    snapshot.missions.lastGameClaimDate !== snapshot.missions.lastGameWinDate
  ) {
    const prevTier = snapshot.missions.pendingGameRewardTier;
    nextPacks[prevTier] = (nextPacks[prevTier] ?? 0) + 1;
  }

  const activeStreak = computeActiveGameStreak(
    effectiveWinDate,
    snapshot.missions.gameStreak,
    today
  );
  const nextStreak = activeStreak + 1;
  const tier = resolveStreakRewardTier(nextStreak);

  return {
    awarded: true,
    tier,
    streak: nextStreak,
    snapshot: {
      ...snapshot,
      packs: nextPacks,
      missions: {
        ...snapshot.missions,
        lastGameWinDate: today,
        gameStreak: nextStreak,
        pendingGameRewardTier: tier,
      },
      hasActivity: true,
      revision: snapshot.revision + 1,
      updatedAt: nowIso,
    },
  };
}

/**
 * Server-side claim of today's completed daily minigame pack reward.
 */
export function applyDailyGameClaimOnSnapshot(
  snapshot: AccountAlbumSnapshot,
  today: string,
  nowIso = new Date().toISOString()
):
  | {
      readonly ok: true;
      readonly snapshot: AccountAlbumSnapshot;
      readonly tier: PackTier;
      readonly streak: number;
    }
  | { readonly ok: false; readonly reason: "already_claimed" | "game_not_completed" } {
  if (snapshot.missions.lastGameClaimDate === today) {
    return { ok: false, reason: "already_claimed" };
  }

  const effectiveWinDate =
    snapshot.missions.lastGameWinDate ?? snapshot.missions.lastGameClaimDate;
  if (effectiveWinDate !== today) {
    return { ok: false, reason: "game_not_completed" };
  }

  const streak = computeActiveGameStreak(effectiveWinDate, snapshot.missions.gameStreak, today);
  const tier = snapshot.missions.pendingGameRewardTier ?? resolveStreakRewardTier(streak);

  return {
    ok: true,
    tier,
    streak,
    snapshot: {
      ...snapshot,
      packs: {
        ...snapshot.packs,
        [tier]: (snapshot.packs[tier] ?? 0) + 1,
      },
      missions: {
        ...snapshot.missions,
        lastGameWinDate: today,
        lastGameClaimDate: today,
        pendingGameRewardTier: undefined,
      },
      hasActivity: true,
      revision: snapshot.revision + 1,
      updatedAt: nowIso,
    },
  };
}

/**
 * Server-side recycling of 10 duplicate cards into 1 Sobre Rojiblanco.
 */
export function applyRecycleDuplicatesOnSnapshot(
  snapshot: AccountAlbumSnapshot,
  nowIso = new Date().toISOString()
):
  | { readonly ok: true; readonly snapshot: AccountAlbumSnapshot }
  | { readonly ok: false; readonly reason: "insufficient_duplicates" } {
  const duplicateEntries: Array<[string, number]> = [];
  for (const [slug, qty] of Object.entries(snapshot.cards)) {
    if (qty > 1) duplicateEntries.push([slug, qty - 1]);
  }

  const totalDuplicates = duplicateEntries.reduce((acc, [, dupQty]) => acc + dupQty, 0);
  if (totalDuplicates < DUPLICATES_RECIPE_COST) {
    return { ok: false, reason: "insufficient_duplicates" };
  }

  let needed = DUPLICATES_RECIPE_COST;
  const nextCards: Record<string, number> = { ...snapshot.cards };
  for (const [slug, dupQty] of duplicateEntries) {
    if (needed <= 0) break;
    const take = Math.min(needed, dupQty);
    nextCards[slug] = (nextCards[slug] ?? 1) - take;
    needed -= take;
  }

  return {
    ok: true,
    snapshot: {
      ...snapshot,
      cards: nextCards,
      packs: {
        ...snapshot.packs,
        rojiblanco: (snapshot.packs.rojiblanco ?? 0) + 1,
      },
      hasActivity: true,
      revision: snapshot.revision + 1,
      updatedAt: nowIso,
    },
  };
}
