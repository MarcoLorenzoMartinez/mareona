// Client: Barra de búsqueda reactiva y filtros de competición para rivales
"use client";

import type { RivalScopeFilter } from "@/lib/historical/rivals-types";

interface RivalsFilterBarProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly activeScope: RivalScopeFilter;
  readonly onScopeChange: (scope: RivalScopeFilter) => void;
  readonly activeTab: "list" | "spain-map" | "world-map";
  readonly onTabChange: (tab: "list" | "spain-map" | "world-map") => void;
  readonly totalMatchesCount: number;
  readonly filteredRivalsCount: number;
}

const SCOPE_ITEMS: readonly { readonly id: RivalScopeFilter; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "primera", label: "1.ª División" },
  { id: "segunda", label: "2.ª División" },
  { id: "copa", label: "Copa" },
  { id: "uefa", label: "Europa" },
  { id: "promocion", label: "Promoción" },
];

/**
 * Filter and view switcher bar adhering to AGENTS.md rules 8 and 9:
 * - Segmented controls in rounded-full pill styling.
 * - Active state in corporate Sporting red with white text.
 * - Instant search input without submit button.
 */
export function RivalsFilterBar({
  searchQuery,
  onSearchChange,
  activeScope,
  onScopeChange,
  activeTab,
  onTabChange,
  filteredRivalsCount,
}: RivalsFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs sm:p-4">
      {/* Top Row: View Mode Switcher (List | Mapa España | Mapa Mundo) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Modo de exploración de rivales"
          className="inline-flex rounded-full border border-[var(--border)] bg-neutral-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "list"}
            onClick={() => onTabChange("list")}
            className={`min-h-[36px] rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
              activeTab === "list"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Lista de Rivales ({filteredRivalsCount})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "spain-map"}
            onClick={() => onTabChange("spain-map")}
            className={`min-h-[36px] rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
              activeTab === "spain-map"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Mapa de España
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "world-map"}
            onClick={() => onTabChange("world-map")}
            className={`min-h-[36px] rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
              activeTab === "world-map"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Mapa del Mundo
          </button>
        </div>

        {/* Live Search Input: Dynamic without submit button */}
        <div className="relative w-full sm:w-72">
          <label htmlFor="rival-search-input" className="sr-only">
            Buscar rival por nombre, comunidad o provincia
          </label>
          <input
            id="rival-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por equipo o provincia..."
            className="w-full rounded-full border border-[var(--border)] bg-neutral-50 px-4 py-2 text-xs font-medium text-[var(--foreground)] placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Competition Scope Pills (Only relevant in List view) */}
      {activeTab === "list" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {SCOPE_ITEMS.map((item) => {
            const isSelected = activeScope === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onScopeChange(item.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-sans transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] font-semibold hover:border-neutral-300 hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
