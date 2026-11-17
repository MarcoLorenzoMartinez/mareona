// Client: Barra de búsqueda reactiva y selector de vista para rivales
"use client";

import type { RivalLayoutMode, RivalScopeFilter, RivalSortOption } from "@/lib/historical/rivals-types";
import { RivalsSortControls } from "./rivals-sort-controls";

interface RivalsFilterBarProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly activeScope: RivalScopeFilter;
  readonly onScopeChange: (scope: RivalScopeFilter) => void;
  readonly activeTab: "list" | "spain-map" | "world-map";
  readonly onTabChange: (tab: "list" | "spain-map" | "world-map") => void;
  readonly activeSort: RivalSortOption;
  readonly onSortChange: (sort: RivalSortOption) => void;
  readonly layoutMode: RivalLayoutMode;
  readonly onLayoutModeChange: (mode: RivalLayoutMode) => void;
  readonly totalMatchesCount: number;
  readonly filteredRivalsCount: number;
}

export function RivalsFilterBar({
  searchQuery,
  onSearchChange,
  activeScope,
  onScopeChange,
  activeTab,
  onTabChange,
  activeSort,
  onSortChange,
  layoutMode,
  onLayoutModeChange,
  filteredRivalsCount,
}: RivalsFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs sm:p-4">
      {/* Top Row: View Mode Switcher (List | Mapa España | Mapa Mundo) + Search Input */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Modo de exploración de rivales"
          className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "list"}
            onClick={() => onTabChange("list")}
            className={`min-h-[36px] rounded-full px-3.5 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              activeTab === "list"
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            Lista de Rivales
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "spain-map"}
            onClick={() => onTabChange("spain-map")}
            className={`min-h-[36px] rounded-full px-3.5 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              activeTab === "spain-map"
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            Mapa de España
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "world-map"}
            onClick={() => onTabChange("world-map")}
            className={`min-h-[36px] rounded-full px-3.5 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              activeTab === "world-map"
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            Mapa del Mundo
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <label htmlFor="rival-search-input" className="sr-only">
            Buscar rival por nombre, comunidad o provincia
          </label>
          <input
            id="rival-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por equipo o provincia..."
            autoComplete="off"
            className="w-full rounded-full border border-[var(--border)] bg-neutral-50 pl-4 pr-8 py-2 text-xs font-medium text-[var(--foreground)] placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Secondary Controls: Only visible in List view */}
      {activeTab === "list" && (
        <RivalsSortControls
          activeScope={activeScope}
          onScopeChange={onScopeChange}
          activeSort={activeSort}
          onSortChange={onSortChange}
          layoutMode={layoutMode}
          onLayoutModeChange={onLayoutModeChange}
        />
      )}
    </div>
  );
}
