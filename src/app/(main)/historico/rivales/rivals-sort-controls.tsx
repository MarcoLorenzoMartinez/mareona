// Client: Controles contextuales de competición, ordenación y formato para rivales
"use client";

import type { RivalLayoutMode, RivalScopeFilter, RivalSortOption } from "@/lib/historical/rivals-types";

interface RivalsSortControlsProps {
  readonly activeScope: RivalScopeFilter;
  readonly onScopeChange: (scope: RivalScopeFilter) => void;
  readonly activeSort: RivalSortOption;
  readonly onSortChange: (sort: RivalSortOption) => void;
  readonly layoutMode: RivalLayoutMode;
  readonly onLayoutModeChange: (mode: RivalLayoutMode) => void;
}

const SCOPE_ITEMS: readonly { readonly id: RivalScopeFilter; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "primera", label: "1.ª División" },
  { id: "segunda", label: "2.ª División" },
  { id: "copa", label: "Copa" },
  { id: "uefa", label: "Europa" },
  { id: "promocion", label: "Promoción" },
];

const SORT_ITEMS: readonly { readonly id: RivalSortOption; readonly label: string }[] = [
  { id: "alpha", label: "A-Z" },
  { id: "played", label: "Más jugados" },
  { id: "won", label: "Más victorias" },
  { id: "winRate", label: "Mayor %" },
];

export function RivalsSortControls({
  activeScope,
  onScopeChange,
  activeSort,
  onSortChange,
  layoutMode,
  onLayoutModeChange,
}: RivalsSortControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-1 border-t border-[var(--border)]/60">
      {/* Competition Scope Segmented Control */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div
          role="radiogroup"
          aria-label="Filtrar rivales por competición"
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          {SCOPE_ITEMS.map((item) => {
            const isSelected = activeScope === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onScopeChange(item.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-sans transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Selector & Layout Switcher */}
      <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] hidden sm:inline">
            Orden:
          </span>
          <div
            role="radiogroup"
            aria-label="Criterio de ordenación"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5"
          >
            {SORT_ITEMS.map((s) => {
              const isSelected = activeSort === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSortChange(s.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-sans transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                      : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Toggle: Grid vs Table */}
        <div
          role="group"
          aria-label="Selector de formato de visualización"
          className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5"
        >
          <button
            type="button"
            aria-label="Ver como cuadrícula de tarjetas"
            aria-pressed={layoutMode === "grid"}
            onClick={() => onLayoutModeChange("grid")}
            className={`p-1.5 rounded-full text-xs font-bold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              layoutMode === "grid"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title="Vista cuadrícula"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Ver como tabla compacta"
            aria-pressed={layoutMode === "table"}
            onClick={() => onLayoutModeChange("table")}
            className={`p-1.5 rounded-full text-xs font-bold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              layoutMode === "table"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title="Vista tabla compacta"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm1.5 1v2.5h13V3a.5.5 0 0 0-.5-.5H2a.5.5 0 0 0-.5.5zm13 3.5h-13v3h13v-3zm0 4h-13V14a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-2.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
