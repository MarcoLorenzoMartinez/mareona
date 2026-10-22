"use client"; // Client: Gestión interactiva de filtros de década y eventos de UI

import type { CardDecade } from "@/lib/cards/types";
import { CARD_DECADES } from "@/lib/cards/schemas";

export type AlbumFilter = CardDecade | "all" | "duplicates";

interface AlbumHeaderProps {
  readonly selectedFilter: AlbumFilter;
  readonly onSelectFilter: (filter: AlbumFilter) => void;
  readonly ownedCount: number;
  readonly totalCount: number;
  readonly duplicateCount?: number;
  readonly onOpenPackClick: () => void;
}

export function AlbumHeader({
  selectedFilter,
  onSelectFilter,
  ownedCount,
  totalCount,
  duplicateCount = 0,
  onOpenPackClick,
}: AlbumHeaderProps) {
  const progressPct = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <header className="flex flex-col gap-3 border-b border-[var(--border)] pb-4">
      <h1 className="sr-only">Colección de Cromos Históricos</h1>

      {/* Barra de Progreso Minimalista con acción directa de sobre */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center justify-between text-xs sm:pr-4">
            <span className="font-medium text-[var(--foreground-muted)]">Progreso</span>
            <span className="font-sans font-bold tabular-nums text-[var(--foreground)]">
              {ownedCount} / {totalCount} ({progressPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]">
            <div
              className="h-full bg-[#e2001a] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPackClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] transition-colors"
        >
          <span>Abrir Sobre</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">5 cartas</span>
        </button>
      </div>

      {/* Selector de Décadas y Duplicados tipo Píldora (Horizontal Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectFilter("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            selectedFilter === "all"
              ? "bg-[#e2001a] text-white"
              : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a]/50"
          }`}
        >
          Todas
        </button>

        <button
          type="button"
          onClick={() => onSelectFilter("duplicates")}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            selectedFilter === "duplicates"
              ? "bg-[#e2001a] text-white"
              : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a]/50"
          }`}
        >
          <span>Duplicados</span>
          {duplicateCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                selectedFilter === "duplicates"
                  ? "bg-white text-[#e2001a]"
                  : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {duplicateCount}
            </span>
          )}
        </button>

        {CARD_DECADES.map((dec) => (
          <button
            key={dec}
            type="button"
            onClick={() => onSelectFilter(dec)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              selectedFilter === dec
                ? "bg-[#e2001a] text-white"
                : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a]/50"
            }`}
          >
            {dec}
          </button>
        ))}
      </div>
    </header>
  );
}
