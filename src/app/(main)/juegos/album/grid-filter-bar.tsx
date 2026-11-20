"use client"; // Client: Barra de filtros avanzados y ordenación interactiva para la vista cuadrícula

import type { CardDecade } from "@/lib/cards/types";
import {
  type GridFilterState,
  type SpecialCategory,
  type SortField,
  DEFAULT_GRID_FILTER_STATE,
  SORT_FIELD_OPTIONS,
  RATING_PRESETS,
} from "./grid-filter-types.ts";
import { GridFilterCategories } from "./grid-filter-categories";
import { getDictionary } from "@/i18n";

interface GridFilterBarProps {
  readonly filterState: GridFilterState;
  readonly onFilterChange: (next: GridFilterState) => void;
  readonly duplicateCount?: number;
  readonly totalFilteredCount: number;
}

export function GridFilterBar({
  filterState,
  onFilterChange,
  duplicateCount = 0,
  totalFilteredCount,
}: GridFilterBarProps) {
  const dict = getDictionary();
  const isAnyFilterActive =
    filterState.selectedDecades.size > 0 ||
    filterState.selectedCategories.size > 0 ||
    filterState.minRating > 0 ||
    filterState.maxRating < 99 ||
    filterState.sortField !== "number" ||
    filterState.sortDirection !== "asc";

  const handleToggleCategory = (cat: SpecialCategory) => {
    const nextCategories = new Set(filterState.selectedCategories);
    if (cat === "crests") {
      if (nextCategories.has("crests")) {
        nextCategories.delete("crests");
        nextCategories.delete("coaches");
      } else {
        nextCategories.add("crests");
        nextCategories.add("coaches");
      }
    } else if (nextCategories.has(cat)) {
      nextCategories.delete(cat);
    } else {
      nextCategories.add(cat);
    }
    onFilterChange({ ...filterState, selectedCategories: nextCategories });
  };

  const handleToggleDecade = (dec: CardDecade) => {
    const nextDecades = new Set(filterState.selectedDecades);
    if (nextDecades.has(dec)) nextDecades.delete(dec);
    else nextDecades.add(dec);
    onFilterChange({ ...filterState, selectedDecades: nextDecades });
  };

  const isAllActive =
    filterState.selectedDecades.size === 0 &&
    filterState.selectedCategories.size === 0 &&
    filterState.minRating === 0;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--border)] bg-white p-3 shadow-2xs">
      {/* Fila 1: Ordenación, Rango de valoración y Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2.5 text-xs">
        {/* Selector de Criterio de Ordenación */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-neutral-500">{dict.games.album.grid.sortLabel}</span>
          <div className="flex items-center gap-1">
            <select
              value={filterState.sortField}
              onChange={(e) => onFilterChange({ ...filterState, sortField: e.target.value as SortField })}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-bold text-neutral-800 focus:outline-hidden focus:border-[#e2001a]"
              aria-label={dict.games.album.grid.sortAria}
            >
              {SORT_FIELD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onFilterChange({ ...filterState, sortDirection: filterState.sortDirection === "asc" ? "desc" : "asc" })}
              title={filterState.sortDirection === "asc" ? dict.games.album.grid.sortAscTitle : dict.games.album.grid.sortDescTitle}
              aria-label={filterState.sortDirection === "asc" ? dict.games.album.grid.sortAscAria : dict.games.album.grid.sortDescAria}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-bold text-neutral-800 hover:border-[#e2001a] active:scale-95"
            >
              {filterState.sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Filtro Rápido por Valoración Mínima (OVR) */}
          <div className="flex items-center gap-1 pl-1 sm:pl-3">
            <span className="font-semibold text-neutral-500 hidden sm:inline">{dict.games.album.grid.ratingLabel}</span>
            {RATING_PRESETS.map((p) => {
              const isSelected = filterState.minRating === p.min && filterState.maxRating === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onFilterChange({ ...filterState, minRating: p.min, maxRating: p.max })}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#e2001a] text-white shadow-2xs"
                      : "border border-[var(--border)] bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador y Botón Limpiar */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs font-bold tabular-nums text-neutral-500">
            {totalFilteredCount} {totalFilteredCount === 1 ? dict.games.album.grid.cardSingular : dict.games.album.grid.cardPlural}
          </span>
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={() => onFilterChange(DEFAULT_GRID_FILTER_STATE)}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-[#e2001a] hover:bg-red-50 transition-colors"
            >
              {dict.games.album.grid.clearButton}
            </button>
          )}
        </div>
      </div>

      {/* Fila 2: Categorías y Multiselección de Décadas */}
      <GridFilterCategories
        selectedDecades={filterState.selectedDecades}
        selectedCategories={filterState.selectedCategories}
        isAllActive={isAllActive}
        duplicateCount={duplicateCount}
        onToggleCategory={handleToggleCategory}
        onToggleDecade={handleToggleDecade}
        onReset={() => onFilterChange(DEFAULT_GRID_FILTER_STATE)}
      />
    </div>
  );
}
