import { matchesSearchQuery } from "../utils/search-utils.ts";
import type { LineupPlayer, PlayerCategory } from "./types.ts";

/**
 * Maps granular tactical role (e.g. LI, DFC, MCD, DC) to high-level squad line.
 * Used to prioritize players in that same tactical line during selection.
 */
export function getTargetPositionFromRole(
  role: string | null
): "POR" | "DEF" | "MED" | "DEL" | null {
  if (!role) return null;
  if (role === "POR") return "POR";
  if (["LI", "LD", "DFC", "CAD", "CAI"].includes(role)) return "DEF";
  if (["MCD", "MC", "MCO", "MI", "MD", "EI", "ED"].includes(role)) return "MED";
  if (role === "DC") return "DEL";
  return null;
}

const POSITION_ORDER: Record<string, number> = {
  POR: 0,
  DEF: 1,
  MED: 2,
  DEL: 3,
};

const CATEGORY_ORDER: Record<string, number> = {
  first_team: 0,
  custom: 1,
  filial: 2,
  juvenil: 3,
};

export interface FilterRosterOptions {
  readonly players: readonly LineupPlayer[];
  readonly assignedPlayerIds: ReadonlySet<string>;
  readonly selectedCategory: PlayerCategory | "all";
  readonly selectedPosition: string;
  readonly searchQuery: string;
  readonly targetPosition: "POR" | "DEF" | "MED" | "DEL" | null;
}

/**
 * Filters and prioritizes footballers for display in the tactical squad drawer:
 * 1. Matches user query and category/position filters.
 * 2. Prioritizes players matching the targeted pitch role.
 * 3. Shows unassigned players before already fielded ones.
 * 4. Natural football order (POR -> DEF -> MED -> DEL), then category, then shirt number.
 */
export function filterAndSortRosterPlayers({
  players,
  assignedPlayerIds,
  selectedCategory,
  selectedPosition,
  searchQuery,
  targetPosition,
}: FilterRosterOptions): readonly LineupPlayer[] {
  const query = searchQuery.trim();

  const filtered = players.filter((player) => {
    if (selectedCategory !== "all" && player.category !== selectedCategory) return false;
    if (selectedPosition !== "all" && player.defaultPosition !== selectedPosition) return false;
    if (query) {
      const matchesName =
        matchesSearchQuery(player.displayName, query) ||
        matchesSearchQuery(player.fullName, query);
      const matchesNumber = player.shirtNumber?.toString() === query;
      if (!matchesName && !matchesNumber) return false;
    }
    return true;
  });

  return filtered.slice().sort((a, b) => {
    if (targetPosition) {
      const aMatches = a.defaultPosition === targetPosition;
      const bMatches = b.defaultPosition === targetPosition;
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
    }

    const aAssigned = assignedPlayerIds.has(a.id);
    const bAssigned = assignedPlayerIds.has(b.id);
    if (!aAssigned && bAssigned) return -1;
    if (aAssigned && !bAssigned) return 1;

    const posA = POSITION_ORDER[a.defaultPosition] ?? 99;
    const posB = POSITION_ORDER[b.defaultPosition] ?? 99;
    if (posA !== posB) return posA - posB;

    const catA = CATEGORY_ORDER[a.category] ?? 99;
    const catB = CATEGORY_ORDER[b.category] ?? 99;
    if (catA !== catB) return catA - catB;

    const numA = a.shirtNumber ?? 999;
    const numB = b.shirtNumber ?? 999;
    return numA - numB;
  });
}

/**
 * Finds the index of the first player outside the suggested target position,
 * used to render a subtle visual separator divider.
 */
export function calculateDividerIndex(
  players: readonly LineupPlayer[],
  targetPosition: string | null,
  selectedPosition: string
): number {
  if (!targetPosition || selectedPosition !== "all") return -1;
  const firstOther = players.findIndex((p) => p.defaultPosition !== targetPosition);
  if (firstOther > 0 && firstOther < players.length) {
    return firstOther;
  }
  return -1;
}
