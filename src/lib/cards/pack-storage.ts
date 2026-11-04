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

export const DEFAULT_MISSION_STATE: DailyMissionState = {
  todayDate: "",
  hasClaimedDailyLogin: false,
  hasClaimedDailyGame: false,
  isMatchday: false,
};

/**
 * Returns the current date in YYYY-MM-DD local format.
 */
export function getTodayDateString(overrideDate?: Date): string {
  const d = overrideDate ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Reads user pack stock from storage or returns default starter packs.
 */
export function loadUserPackInventory(): UserPackInventory {
  if (typeof window === "undefined") return { ...DEFAULT_PACK_INVENTORY };
  try {
    const raw = window.localStorage.getItem(PACK_INVENTORY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PACK_INVENTORY };
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
 */
export function saveUserPackInventory(inventory: UserPackInventory): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PACK_INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent("mareona_pack_inventory_changed", { detail: inventory }));
  } catch {
    // LocalStorage quota or privacy mode fallback
  }
}

/**
 * Adds packs to the user inventory.
 */
export function addPacksToInventory(tier: PackTier, count = 1): UserPackInventory {
  const current = loadUserPackInventory();
  const next: UserPackInventory = {
    ...current,
    [tier]: (current[tier] ?? 0) + count,
  };
  saveUserPackInventory(next);
  return next;
}

/**
 * Resets user pack stock to zero.
 */
export function clearUserPacks(): UserPackInventory {
  const next: UserPackInventory = {
    aficionado: 0,
    rojiblanco: 0,
    leyenda: 0,
  };
  saveUserPackInventory(next);
  return next;
}

/**
 * Consumes one pack from user inventory if available.
 */
export function consumeUserPack(tier: PackTier): boolean {
  const current = loadUserPackInventory();
  if ((current[tier] ?? 0) <= 0) return false;
  const next: UserPackInventory = {
    ...current,
    [tier]: current[tier] - 1,
  };
  saveUserPackInventory(next);
  return true;
}

/**
 * Reads user card inventory (slug -> quantity).
 */
export function loadUserCardInventory(): Record<string, number> {
  if (typeof window === "undefined") {
    const initial: Record<string, number> = {};
    for (const slug of CANONICAL_STARTER_SLUGS) initial[slug] = 1;
    return initial;
  }
  try {
    const raw = window.localStorage.getItem(CARD_INVENTORY_STORAGE_KEY);
    if (!raw) {
      const initial: Record<string, number> = {};
      for (const slug of CANONICAL_STARTER_SLUGS) initial[slug] = 1;
      return initial;
    }
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    const fallback: Record<string, number> = {};
    for (const slug of CANONICAL_STARTER_SLUGS) fallback[slug] = 1;
    return fallback;
  }
}

/**
 * Saves user card inventory to storage.
 */
export function saveUserCardInventory(inventory: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CARD_INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent("mareona_card_inventory_changed", { detail: inventory }));
  } catch {
    // LocalStorage quota fallback
  }
}

/**
 * Adds an array of cards to the user's collection and saves to storage.
 */
export function addCardsToInventory(newCards: readonly Card[]): Record<string, number> {
  const current = loadUserCardInventory();
  const next = { ...current };
  for (const card of newCards) {
    next[card.slug] = (next[card.slug] ?? 0) + 1;
  }
  saveUserCardInventory(next);
  return next;
}

interface StoredMissionState {
  lastLoginClaimDate?: string;
  lastGameClaimDate?: string;
}

function loadStoredMissionState(): StoredMissionState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MISSIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredMissionState) : {};
  } catch {
    return {};
  }
}

function saveStoredMissionState(state: StoredMissionState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("mareona_missions_state_changed", { detail: state }));
  } catch {
    // LocalStorage fallback
  }
}

/**
 * Computes the live state of daily objectives.
 */
export function getDailyMissionState(todayOverride?: string): DailyMissionState {
  if (typeof window === "undefined" && !todayOverride) {
    return { ...DEFAULT_MISSION_STATE };
  }
  const today = todayOverride ?? getTodayDateString();
  const state = loadStoredMissionState();
  const now = new Date();
  // Saturday (6) and Sunday (0) are designated matchdays / weekend bonus
  const dayOfWeek = now.getDay();
  const isMatchday = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    todayDate: today,
    hasClaimedDailyLogin: state.lastLoginClaimDate === today,
    hasClaimedDailyGame: state.lastGameClaimDate === today,
    isMatchday,
  };
}

/**
 * Claims the daily login reward.
 */
export function claimDailyLoginPack(): { success: boolean; tier?: PackTier; reason?: string } {
  const today = getTodayDateString();
  const state = loadStoredMissionState();
  if (state.lastLoginClaimDate === today) {
    return { success: false, reason: "already_claimed" };
  }

  const now = new Date();
  const isMatchday = now.getDay() === 0 || now.getDay() === 6;
  const tier: PackTier = isMatchday ? "rojiblanco" : "aficionado";

  addPacksToInventory(tier, 1);
  saveStoredMissionState({ ...state, lastLoginClaimDate: today });
  return { success: true, tier };
}

/**
 * Awards the daily game pack when a user solves a daily minigame.
 * Strictly prevents awards from historical/archive challenges.
 */
export function awardDailyGamePack(challengeDateStr?: string): {
  awarded: boolean;
  tier?: PackTier;
  reason?: "historic_archive" | "already_claimed_today";
} {
  const today = getTodayDateString();

  // Strict check: if playing past dates from the archive modal, no pack awarded
  if (challengeDateStr && challengeDateStr !== today) {
    return { awarded: false, reason: "historic_archive" };
  }

  const state = loadStoredMissionState();
  if (state.lastGameClaimDate === today) {
    return { awarded: false, reason: "already_claimed_today" };
  }

  addPacksToInventory("rojiblanco", 1);
  saveStoredMissionState({ ...state, lastGameClaimDate: today });
  return { awarded: true, tier: "rojiblanco" };
}

/**
 * Recycles 10 duplicate cards into 1 Sobre Rojiblanco.
 */
export function recycleDuplicates(): {
  success: boolean;
  recycledCount: number;
  remainingDuplicates: number;
  reason?: "insufficient_duplicates";
} {
  const currentCards = loadUserCardInventory();
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

  saveUserCardInventory(nextCards);
  addPacksToInventory("rojiblanco", 1);

  return {
    success: true,
    recycledCount: DUPLICATES_RECIPE_COST,
    remainingDuplicates: totalDuplicates - DUPLICATES_RECIPE_COST,
  };
}
