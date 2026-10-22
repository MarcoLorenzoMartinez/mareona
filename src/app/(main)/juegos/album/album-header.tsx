"use client"; // Client: Gestión interactiva de filtros de década y eventos de UI

import type { CardDecade } from "@/lib/cards/types";
import { CARD_DECADES } from "@/lib/cards/schemas";

interface AlbumHeaderProps {
  readonly selectedDecade: CardDecade | "all";
  readonly onSelectDecade: (decade: CardDecade | "all") => void;
  readonly ownedCount: number;
  readonly totalCount: number;
  readonly onOpenPackClick: () => void;
}

export function AlbumHeader({
  selectedDecade,
  onSelectDecade,
  ownedCount,
  totalCount,
  onOpenPackClick,
}: AlbumHeaderProps) {
  const progressPct = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
            Colección de Cromos Históricos
          </h1>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            Descubre a las leyendas del Real Sporting de Gijón desde 1905 hasta hoy.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPackClick}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] transition-colors"
        >
          <span>Abrir Sobre</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">5 cartas</span>
        </button>
      </div>

      {/* Barra de Progreso Minimalista */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-white p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--foreground-muted)]">Progreso de la Colección</span>
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

      {/* Selector de Décadas tipo Píldora (Horizontal Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectDecade("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            selectedDecade === "all"
              ? "bg-[#e2001a] text-white"
              : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a]/50"
          }`}
        >
          Todas
        </button>
        {CARD_DECADES.map((dec) => (
          <button
            key={dec}
            type="button"
            onClick={() => onSelectDecade(dec)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              selectedDecade === dec
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
