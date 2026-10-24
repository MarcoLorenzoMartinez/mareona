import type { Card, CardDecade } from "@/lib/cards/types";
import { getCardChronologicalWeight } from "./album-types.ts";

export type SpecialCategory = "crests" | "moments" | "coaches" | "duplicates";
export type SortField = "number" | "ovr" | "attack" | "defense" | "matches" | "name";
export type SortDirection = "asc" | "desc";

export interface GridFilterState {
  readonly selectedDecades: ReadonlySet<CardDecade>;
  readonly selectedCategories: ReadonlySet<SpecialCategory>;
  readonly minRating: number;
  readonly maxRating: number;
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
}

export const DEFAULT_GRID_FILTER_STATE: GridFilterState = {
  selectedDecades: new Set(),
  selectedCategories: new Set(),
  minRating: 0,
  maxRating: 99,
  sortField: "number",
  sortDirection: "asc",
};

export const SORT_FIELD_OPTIONS: readonly { readonly id: SortField; readonly label: string }[] = [
  { id: "number", label: "N.º Álbum" },
  { id: "ovr", label: "Media (OVR)" },
  { id: "attack", label: "Ataque (ATQ)" },
  { id: "defense", label: "Defensa (DEF)" },
  { id: "matches", label: "Partidos (PJ)" },
  { id: "name", label: "Nombre" },
];

export const RATING_PRESETS: readonly { readonly label: string; readonly min: number; readonly max: number }[] = [
  { label: "Todas", min: 0, max: 99 },
  { label: "≥ 75", min: 75, max: 99 },
  { label: "≥ 80", min: 80, max: 99 },
  { label: "≥ 85", min: 85, max: 99 },
  { label: "≥ 90", min: 90, max: 99 },
];

/**
 * Filters cards for the grid view according to ownership and multi-filter criteria.
 */
export function filterGridCards(
  cards: readonly Card[],
  state: GridFilterState,
  getCardStatus: (slug: string) => { isOwned: boolean; quantity: number }
): Card[] {
  return cards.filter((card) => {
    const { isOwned, quantity } = getCardStatus(card.slug);
    if (!isOwned) return false;

    if (state.selectedCategories.has("duplicates") && quantity <= 1) {
      return false;
    }

    const activeSpecialCategories = new Set(
      [...state.selectedCategories].filter((c) => c !== "duplicates")
    );
    const hasSectionFilter =
      state.selectedDecades.size > 0 || activeSpecialCategories.size > 0;

    if (hasSectionFilter) {
      let matches = false;
      if (card.kind === "crest" && activeSpecialCategories.has("crests")) matches = true;
      if (card.kind === "coach" && activeSpecialCategories.has("coaches")) matches = true;
      if (card.kind === "moment" && activeSpecialCategories.has("moments")) matches = true;
      if (card.kind === "player" && state.selectedDecades.has(card.decade)) matches = true;
      if (!matches) return false;
    }

    if (card.kind === "player") {
      const ovr = card.ovr ?? 0;
      if (state.minRating > 0 && ovr < state.minRating) return false;
      if (state.maxRating < 99 && ovr > state.maxRating) return false;
    } else if (state.minRating > 0) {
      return false;
    }

    return true;
  });
}

/**
 * Sorts filtered grid cards by the requested field and direction.
 */
export function sortGridCards(
  cards: readonly Card[],
  sortField: SortField,
  sortDirection: SortDirection
): Card[] {
  const dir = sortDirection === "asc" ? 1 : -1;

  return [...cards].sort((a, b) => {
    if (sortField === "number") {
      const wa = getCardChronologicalWeight(a);
      const wb = getCardChronologicalWeight(b);
      if (wa !== wb) return (wa - wb) * dir;
      return a.knownAs.localeCompare(b.knownAs) * dir;
    }

    if (sortField === "ovr") {
      const ra = a.ovr ?? 0;
      const rb = b.ovr ?? 0;
      if (ra !== rb) return (ra - rb) * dir;
    }

    if (sortField === "attack") {
      const aa = a.attackPower ?? 0;
      const ab = b.attackPower ?? 0;
      if (aa !== ab) return (aa - ab) * dir;
    }

    if (sortField === "defense") {
      const da = a.defensePower ?? 0;
      const db = b.defensePower ?? 0;
      if (da !== db) return (da - db) * dir;
    }

    if (sortField === "matches") {
      const ma = a.matchesPlayed ?? 0;
      const mb = b.matchesPlayed ?? 0;
      if (ma !== mb) return (ma - mb) * dir;
    }

    if (sortField === "name") {
      const comp = a.knownAs.localeCompare(b.knownAs);
      if (comp !== 0) return comp * dir;
    }

    const wa = getCardChronologicalWeight(a);
    const wb = getCardChronologicalWeight(b);
    if (wa !== wb) return wa - wb;
    return a.knownAs.localeCompare(b.knownAs);
  });
}
