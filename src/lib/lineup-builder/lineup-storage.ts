import type {
  LineupPlayer,
  PitchAssignedPlayer,
  PitchCoordinate,
  TacticalFormationKey,
  TacticalRole,
} from "./types.ts";
import { TACTICAL_FORMATIONS } from "./formations.ts";

export const LINEUP_STORAGE_KEY = "mareona_lineup_state_v1";

export interface PersistedSlotData {
  readonly slotId: string;
  readonly role: TacticalRole;
  readonly coord: PitchCoordinate;
  readonly playerId: string | null;
}

export interface PersistedLineupData {
  readonly formationKey: TacticalFormationKey;
  readonly customPlayers: readonly LineupPlayer[];
  readonly slots: readonly PersistedSlotData[];
}

/**
 * Saves current tactical board configuration into browser localStorage.
 */
export function savePersistedLineup(
  formationKey: TacticalFormationKey,
  customPlayers: readonly LineupPlayer[],
  assignedSlots: readonly PitchAssignedPlayer[]
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedLineupData = {
      formationKey,
      customPlayers,
      slots: assignedSlots.map((s) => ({
        slotId: s.slotId,
        role: s.role,
        coord: s.coord,
        playerId: s.player?.id ?? null,
      })),
    };
    window.localStorage.setItem(LINEUP_STORAGE_KEY, JSON.stringify(payload));
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("mareona_local_account_mutated"));
    }
  } catch {
    // Non-blocking quota failure
  }
}

/**
 * Loads persisted tactical board configuration from browser localStorage.
 */
export function loadPersistedLineup(): PersistedLineupData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LINEUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedLineupData;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.formationKey ||
      !TACTICAL_FORMATIONS[parsed.formationKey] ||
      !Array.isArray(parsed.slots) ||
      parsed.slots.length !== 11
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Clears persisted tactical board configuration from browser localStorage.
 */
export function clearPersistedLineup(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LINEUP_STORAGE_KEY);
  } catch {
    // Non-blocking quota failure
  }
}

/**
 * Reconstitutes slots by matching persisted player IDs with current player roster.
 */
export function restoreSlotsWithRoster(
  savedSlots: readonly PersistedSlotData[],
  playerPool: readonly LineupPlayer[]
): readonly PitchAssignedPlayer[] {
  return savedSlots.map((s) => ({
    slotId: s.slotId,
    role: s.role,
    coord: s.coord,
    player: s.playerId ? playerPool.find((p) => p.id === s.playerId) ?? null : null,
  }));
}
