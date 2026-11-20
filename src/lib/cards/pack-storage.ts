import type { Card, DailyMissionState, PackTier, UserPackInventory } from "./types.ts";

export const PACK_INVENTORY_STORAGE_KEY = "mareona_user_packs_v1";
export const CARD_INVENTORY_STORAGE_KEY = "mareona_card_inventory_v1";
export const MISSIONS_STORAGE_KEY = "mareona_missions_state_v1";

export const DEFAULT_PACK_INVENTORY: UserPackInventory = {
  aficionado: 1,
  rojiblanco: 1,
  leyenda: 0,
};

export const CANONICAL_STARTER_SLUGS: readonly string[] = [
  "quini-1979",
  "joaquin-alonso-1985",
  "ablanedo-ii-1985",
  "david-villa-2002",
  "cote-2024",
  "gaspar-campos-2024",
];

export const DUPLICATES_RECIPE_COST = 10;
export const WEEKLY_STREAK_CYCLE = 7;

export const DEFAULT_MISSION_STATE: DailyMissionState = {
  todayDate: "",
  hasClaimedDailyLogin: false,
  hasCompletedDailyGame: false,
  hasClaimedDailyGame: false,
  isMatchday: false,
  gameStreak: 0,
};

/**
 * Returns the current date in YYYY-MM-DD format anchored to Europe/Madrid timezone.
 */
export function getTodayDateString(overrideDate?: Date): string {
  const d = overrideDate ?? new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Returns the previous calendar date in YYYY-MM-DD format given an ISO date string.
 *
 * @param dateStr - Reference date in YYYY-MM-DD format.
 * @returns Previous day in YYYY-MM-DD format.
 */
export function getPreviousDateString(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const d = new Date(year, month - 1, day - 1);
  const prevYear = d.getFullYear();
  const prevMonth = String(d.getMonth() + 1).padStart(2, "0");
  const prevDay = String(d.getDate()).padStart(2, "0");
  return `${prevYear}-${prevMonth}-${prevDay}`;
}

/**
 * Computes the active consecutive daily game streak for a user on a given date.
 * Preserves streak if the last claim was today or yesterday; resets to 0 if a day was missed.
 *
 * @param lastGameClaimDate - Last YYYY-MM-DD date when the user won a daily challenge.
 * @param storedStreak - Persisted streak counter.
 * @param today - Current YYYY-MM-DD reference date.
 * @returns Active consecutive streak count.
 */
export function computeActiveGameStreak(
  lastGameClaimDate: string | undefined,
  storedStreak: number | undefined,
  today: string
): number {
  if (!lastGameClaimDate) return 0;
  const effectiveStreak = storedStreak && storedStreak > 0 ? storedStreak : 1;
  if (lastGameClaimDate === today) {
    return effectiveStreak;
  }
  if (lastGameClaimDate === getPreviousDateString(today)) {
    return effectiveStreak;
  }
  return 0;
}

/**
 * Resolves the pack tier earned for reaching a given consecutive daily game streak.
 * Every 7th consecutive day upgrades the standard Sobre Rojiblanco to a Sobre Leyenda.
 *
 * @param streak - Consecutive daily game streak count (1-based).
 * @returns PackTier awarded for this milestone.
 */
export function resolveStreakRewardTier(streak: number): PackTier {
  return streak > 0 && streak % WEEKLY_STREAK_CYCLE === 0 ? "leyenda" : "rojiblanco";
}

/**
 * Resolves the localStorage key for packs, partitioning by userId when available.
 */
function getPackStorageKey(userId?: string): string {
  return userId ? `${PACK_INVENTORY_STORAGE_KEY}_${userId}` : PACK_INVENTORY_STORAGE_KEY;
}

/**
 * Resolves the localStorage key for cards, partitioning by userId when available.
 */
function getCardStorageKey(userId?: string): string {
  return userId ? `${CARD_INVENTORY_STORAGE_KEY}_${userId}` : CARD_INVENTORY_STORAGE_KEY;
}

/**
 * Resolves the localStorage key for missions, partitioning by userId when available.
 */
function getMissionsStorageKey(userId?: string): string {
  return userId ? `${MISSIONS_STORAGE_KEY}_${userId}` : MISSIONS_STORAGE_KEY;
}

/**
 * Reads user pack stock from storage or provisions welcome packs upon sign-in.
 * Unauthenticated guests have 0 packs in inventory until they register or log in.
 *
 * @param userId - Optional unique Supabase user identifier.
 * @returns Current pack count per tier.
 */
export function loadUserPackInventory(userId?: string): UserPackInventory {
  if (!userId) {
    return { aficionado: 0, rojiblanco: 0, leyenda: 0 };
  }
  if (typeof window === "undefined") return { ...DEFAULT_PACK_INVENTORY };
  try {
    const key = getPackStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // Check legacy unkeyed storage to migrate seamless without data loss
      const legacyRaw = window.localStorage.getItem(PACK_INVENTORY_STORAGE_KEY);
      if (legacyRaw) {
        window.localStorage.setItem(key, legacyRaw);
        window.localStorage.removeItem(PACK_INVENTORY_STORAGE_KEY);
        const parsedLegacy = JSON.parse(legacyRaw) as Partial<UserPackInventory>;
        return {
          aficionado: Math.max(0, Number(parsedLegacy.aficionado ?? DEFAULT_PACK_INVENTORY.aficionado)),
          rojiblanco: Math.max(0, Number(parsedLegacy.rojiblanco ?? DEFAULT_PACK_INVENTORY.rojiblanco)),
          leyenda: Math.max(0, Number(parsedLegacy.leyenda ?? DEFAULT_PACK_INVENTORY.leyenda)),
        };
      }
      // New registered user receives the 2 welcome packs directly into account
      window.localStorage.setItem(key, JSON.stringify(DEFAULT_PACK_INVENTORY));
      return { ...DEFAULT_PACK_INVENTORY };
    }
    const parsed = JSON.parse(raw) as Partial<UserPackInventory>;
    return {
      aficionado: Math.max(0, Number(parsed.aficionado ?? DEFAULT_PACK_INVENTORY.aficionado)),
      rojiblanco: Math.max(0, Number(parsed.rojiblanco ?? DEFAULT_PACK_INVENTORY.rojiblanco)),
      leyenda: Math.max(0, Number(parsed.leyenda ?? DEFAULT_PACK_INVENTORY.leyenda)),
    };
  } catch {
    return { ...DEFAULT_PACK_INVENTORY };
  }
}

/**
 * Saves user pack stock to storage and dispatches a change event.
 *
 * @param inventory - New inventory count.
 * @param userId - Optional unique Supabase user identifier.
 */
export function saveUserPackInventory(inventory: UserPackInventory, userId?: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(getPackStorageKey(userId), JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent("mareona_pack_inventory_changed", { detail: inventory }));
  } catch {
    // LocalStorage quota or privacy mode fallback
  }
}

/**
 * Adds packs to the user inventory.
 *
 * @param tier - Booster tier category.
 * @param count - Number of packs to add.
 * @param userId - Optional unique user identifier.
 * @returns Updated inventory.
 */
export function addPacksToInventory(
  tier: PackTier,
  count = 1,
  userId?: string
): UserPackInventory {
  if (!userId) return { aficionado: 0, rojiblanco: 0, leyenda: 0 };
  const current = loadUserPackInventory(userId);
  const next: UserPackInventory = {
    ...current,
    [tier]: (current[tier] ?? 0) + count,
  };
  saveUserPackInventory(next, userId);
  return next;
}

/**
 * Resets user pack stock to zero.
 *
 * @param userId - Optional unique user identifier.
 * @returns Empty inventory.
 */
export function clearUserPacks(userId?: string): UserPackInventory {
  const next: UserPackInventory = {
    aficionado: 0,
    rojiblanco: 0,
    leyenda: 0,
  };
  if (userId) {
    saveUserPackInventory(next, userId);
  }
  return next;
}

/**
 * Consumes one pack from user inventory if available.
 *
 * @param tier - Booster pack tier to consume.
 * @param userId - Optional unique user identifier.
 * @returns True if successfully consumed, false otherwise.
 */
export function consumeUserPack(tier: PackTier, userId?: string): boolean {
  if (!userId) return false;
  const current = loadUserPackInventory(userId);
  if ((current[tier] ?? 0) <= 0) return false;
  const next: UserPackInventory = {
    ...current,
    [tier]: current[tier] - 1,
  };
  saveUserPackInventory(next, userId);
  return true;
}

const LEGACY_REPLACED_CARD_SLUGS: Readonly<Record<string, string>> = {
  "marcos-2022": "mario-gonzalez-2024",
  "trabanco-2020": "pol-valentin-2022",
  "arguelles-2020": "perrin-2025",
};

/**
 * Migrates retired card slugs in a user inventory to their canonical replacements
 * so users never lose owned card progress or duplicate counts across catalog updates.
 */
export function migrateCardInventorySlugs(
  inventory: Readonly<Record<string, number>>
): { inventory: Record<string, number>; migrated: boolean } {
  const next: Record<string, number> = { ...inventory };
  let migrated = false;

  for (const [oldSlug, newSlug] of Object.entries(LEGACY_REPLACED_CARD_SLUGS)) {
    const qty = next[oldSlug];
    if (typeof qty === "number" && qty > 0) {
      next[newSlug] = (next[newSlug] ?? 0) + qty;
      delete next[oldSlug];
      migrated = true;
    } else if (oldSlug in next) {
      delete next[oldSlug];
      migrated = true;
    }
  }

  return { inventory: next, migrated };
}

/**
 * Reads user card inventory (slug -> quantity).
 * Unauthenticated guests start with 0 cards in their collection until signing in and opening packs.
 *
 * @param userId - Optional unique user identifier.
 * @returns Record mapping card slug to owned quantity.
 */
export function loadUserCardInventory(userId?: string): Record<string, number> {
  if (!userId) {
    return {};
  }
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const key = getCardStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // Check legacy unkeyed card inventory to migrate
      const legacyRaw = window.localStorage.getItem(CARD_INVENTORY_STORAGE_KEY);
      if (legacyRaw) {
        const parsedLegacy = JSON.parse(legacyRaw) as Record<string, number>;
        const { inventory } = migrateCardInventorySlugs(parsedLegacy);
        window.localStorage.setItem(key, JSON.stringify(inventory));
        window.localStorage.removeItem(CARD_INVENTORY_STORAGE_KEY);
        return inventory;
      }
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, number>;
    const { inventory, migrated } = migrateCardInventorySlugs(parsed);
    if (migrated) {
      window.localStorage.setItem(key, JSON.stringify(inventory));
    }
    return inventory;
  } catch {
    return {};
  }
}

/**
 * Saves user card inventory to storage.
 *
 * @param inventory - Collection card map.
 * @param userId - Optional unique user identifier.
 */
export function saveUserCardInventory(inventory: Record<string, number>, userId?: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(getCardStorageKey(userId), JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent("mareona_card_inventory_changed", { detail: inventory }));
  } catch {
    // LocalStorage quota fallback
  }
}

/**
 * Adds an array of cards to the user's collection and saves to storage.
 *
 * @param newCards - Cards to incorporate into collection.
 * @param userId - Optional unique user identifier.
 * @returns Updated card inventory.
 */
export function addCardsToInventory(
  newCards: readonly Card[],
  userId?: string
): Record<string, number> {
  if (!userId) return {};
  const current = loadUserCardInventory(userId);
  const next = { ...current };
  for (const card of newCards) {
    next[card.slug] = (next[card.slug] ?? 0) + 1;
  }
  saveUserCardInventory(next, userId);
  return next;
}

interface StoredMissionState {
  lastLoginClaimDate?: string;
  lastGameWinDate?: string;
  lastGameClaimDate?: string;
  gameStreak?: number;
  pendingGameRewardTier?: PackTier;
}

function loadStoredMissionState(userId?: string): StoredMissionState {
  if (typeof window === "undefined" || !userId) return {};
  try {
    const raw = window.localStorage.getItem(getMissionsStorageKey(userId));
    if (!raw) {
      const legacyRaw = window.localStorage.getItem(MISSIONS_STORAGE_KEY);
      if (legacyRaw) {
        window.localStorage.setItem(getMissionsStorageKey(userId), legacyRaw);
        window.localStorage.removeItem(MISSIONS_STORAGE_KEY);
        return JSON.parse(legacyRaw) as StoredMissionState;
      }
      return {};
    }
    return JSON.parse(raw) as StoredMissionState;
  } catch {
    return {};
  }
}

function saveStoredMissionState(state: StoredMissionState, userId?: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(getMissionsStorageKey(userId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("mareona_missions_state_changed", { detail: state }));
  } catch {
    // LocalStorage fallback
  }
}

/**
 * Computes the live state of daily objectives.
 *
 * @param todayOverride - Optional ISO date string for test mocking.
 * @param userId - Optional unique user identifier.
 */
export function getDailyMissionState(todayOverride?: string, userId?: string): DailyMissionState {
  if (typeof window === "undefined" && !todayOverride) {
    return { ...DEFAULT_MISSION_STATE };
  }
  const today = todayOverride ?? getTodayDateString();
  const state = loadStoredMissionState(userId);
  const effectiveWinDate = state.lastGameWinDate ?? state.lastGameClaimDate;
  const gameStreak = computeActiveGameStreak(effectiveWinDate, state.gameStreak, today);

  return {
    todayDate: today,
    hasClaimedDailyLogin: state.lastLoginClaimDate === today,
    hasCompletedDailyGame: effectiveWinDate === today,
    hasClaimedDailyGame: state.lastGameClaimDate === today,
    isMatchday: false,
    gameStreak,
  };
}

/**
 * Claims the daily login reward (1 Sobre Aficionado every day).
 *
 * @param userId - Optional unique user identifier.
 */
export function claimDailyLoginPack(userId?: string): {
  success: boolean;
  tier?: PackTier;
  reason?: string;
} {
  if (!userId) {
    return { success: false, reason: "auth_required" };
  }
  const today = getTodayDateString();
  const state = loadStoredMissionState(userId);
  if (state.lastLoginClaimDate === today) {
    return { success: false, reason: "already_claimed" };
  }

  const tier: PackTier = "aficionado";

  addPacksToInventory(tier, 1, userId);
  saveStoredMissionState({ ...state, lastLoginClaimDate: today }, userId);
  return { success: true, tier };
}

/**
 * Records a daily minigame win, advancing the user's consecutive 7-day streak immediately
 * and unlocking the "Reclamar" button in the Album missions panel.
 * Strictly prevents awards from historical/archive challenges or unauthenticated guests.
 *
 * @param challengeDateStr - Optional date of the played challenge.
 * @param userId - Optional unique user identifier.
 * @param todayOverride - Optional reference date override for deterministic tests.
 */
export function awardDailyGamePack(
  challengeDateStr?: string,
  userId?: string,
  todayOverride?: string
): {
  awarded: boolean;
  tier?: PackTier;
  streak?: number;
  reason?: "historic_archive" | "already_claimed_today" | "auth_required";
} {
  if (!userId) {
    return { awarded: false, reason: "auth_required" };
  }
  const today = todayOverride ?? getTodayDateString();

  // Strict check: if playing past dates from the archive modal, no pack awarded
  if (challengeDateStr && challengeDateStr !== today) {
    return { awarded: false, reason: "historic_archive" };
  }

  const state = loadStoredMissionState(userId);
  const effectiveWinDate = state.lastGameWinDate ?? state.lastGameClaimDate;
  if (effectiveWinDate === today) {
    return { awarded: false, reason: "already_claimed_today" };
  }

  // Safety net: if the user had an unclaimed reward from a previous day, auto-deposit it so it is never lost
  if (
    state.pendingGameRewardTier &&
    state.lastGameWinDate &&
    state.lastGameClaimDate !== state.lastGameWinDate
  ) {
    addPacksToInventory(state.pendingGameRewardTier, 1, userId);
  }

  const activeStreak = computeActiveGameStreak(
    effectiveWinDate,
    state.gameStreak,
    today
  );
  const nextStreak = activeStreak + 1;
  const tier = resolveStreakRewardTier(nextStreak);

  saveStoredMissionState(
    {
      ...state,
      lastGameWinDate: today,
      gameStreak: nextStreak,
      pendingGameRewardTier: tier,
    },
    userId
  );
  return { awarded: true, tier, streak: nextStreak };
}

/**
 * Claims the pending booster pack unlocked by winning today's daily minigame.
 * Delivers 1 Sobre Rojiblanco on days 1-6 and upgrades to 1 Sobre Leyenda every 7th day.
 *
 * @param userId - Optional unique user identifier.
 * @param todayOverride - Optional reference date override for deterministic tests.
 */
export function claimDailyGamePack(
  userId?: string,
  todayOverride?: string
): {
  success: boolean;
  tier?: PackTier;
  streak?: number;
  reason?: "auth_required" | "already_claimed" | "game_not_completed";
} {
  if (!userId) {
    return { success: false, reason: "auth_required" };
  }
  const today = todayOverride ?? getTodayDateString();
  const state = loadStoredMissionState(userId);

  if (state.lastGameClaimDate === today) {
    return { success: false, reason: "already_claimed" };
  }

  const effectiveWinDate = state.lastGameWinDate ?? state.lastGameClaimDate;
  if (effectiveWinDate !== today) {
    return { success: false, reason: "game_not_completed" };
  }

  const streak = computeActiveGameStreak(effectiveWinDate, state.gameStreak, today);
  const tier = state.pendingGameRewardTier ?? resolveStreakRewardTier(streak);

  addPacksToInventory(tier, 1, userId);
  saveStoredMissionState(
    {
      ...state,
      lastGameWinDate: today,
      lastGameClaimDate: today,
      pendingGameRewardTier: undefined,
    },
    userId
  );
  return { success: true, tier, streak };
}

/**
 * Recycles 10 duplicate cards into 1 Sobre Rojiblanco.
 *
 * @param userId - Optional unique user identifier.
 */
export function recycleDuplicates(userId?: string): {
  success: boolean;
  recycledCount: number;
  remainingDuplicates: number;
  reason?: "insufficient_duplicates" | "auth_required";
} {
  if (!userId) {
    return {
      success: false,
      recycledCount: 0,
      remainingDuplicates: 0,
      reason: "auth_required",
    };
  }
  const currentCards = loadUserCardInventory(userId);
  const duplicateEntries: Array<[string, number]> = [];

  for (const [slug, qty] of Object.entries(currentCards)) {
    if (qty > 1) {
      duplicateEntries.push([slug, qty - 1]);
    }
  }

  const totalDuplicates = duplicateEntries.reduce((acc, [, dupQty]) => acc + dupQty, 0);
  if (totalDuplicates < DUPLICATES_RECIPE_COST) {
    return {
      success: false,
      recycledCount: 0,
      remainingDuplicates: totalDuplicates,
      reason: "insufficient_duplicates",
    };
  }

  // Deduct 10 duplicates from inventory
  let neededToDeduct = DUPLICATES_RECIPE_COST;
  const nextCards = { ...currentCards };

  for (const [slug, dupQty] of duplicateEntries) {
    if (neededToDeduct <= 0) break;
    const toTake = Math.min(neededToDeduct, dupQty);
    nextCards[slug] = (nextCards[slug] ?? 1) - toTake;
    neededToDeduct -= toTake;
  }

  saveUserCardInventory(nextCards, userId);
  addPacksToInventory("rojiblanco", 1, userId);

  return {
    success: true,
    recycledCount: DUPLICATES_RECIPE_COST,
    remainingDuplicates: totalDuplicates - DUPLICATES_RECIPE_COST,
  };
}
