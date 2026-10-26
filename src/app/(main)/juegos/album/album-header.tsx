"use client"; // Client: Cabecera con selector de vista (Álbum / Cuadrícula) y progreso de colección

import Link from "next/link";

type ViewMode = "album" | "grid";

interface AlbumHeaderProps {
  readonly ownedCount: number;
  readonly totalCount: number;
  readonly onOpenPackClick: () => void;
  readonly viewMode: ViewMode;
  readonly onViewModeChange: (mode: ViewMode) => void;
}

export function AlbumHeader({
  ownedCount,
  totalCount,
  onOpenPackClick,
  viewMode,
  onViewModeChange,
}: AlbumHeaderProps) {
  const progressPct = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-3">
      {/* Fila superior con botón de retorno y título unificado */}
      <div className="flex items-center gap-3">
        <Link
          href="/juegos"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
          aria-label="Volver a juegos"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Cromos Históricos
        </h1>
      </div>

      {/* Barra de Progreso con acción de apertura de sobre y alternador de vista */}
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

        <div className="flex shrink-0 items-center gap-2">
          {/* Alternador de vista: Álbum o Cuadrícula */}
          <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => onViewModeChange("album")}
              title="Vista Álbum"
              aria-pressed={viewMode === "album"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all ${
                viewMode === "album"
                  ? "bg-[#e2001a] text-white shadow-2xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <rect x="0" y="0" width="5" height="7" rx="0.5" />
                <rect x="7" y="0" width="5" height="7" rx="0.5" />
                <rect x="0" y="9" width="5" height="3" rx="0.5" />
                <rect x="7" y="9" width="5" height="3" rx="0.5" />
              </svg>
              <span>Álbum</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              title="Vista Cuadrícula"
              aria-pressed={viewMode === "grid"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all ${
                viewMode === "grid"
                  ? "bg-[#e2001a] text-white shadow-2xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <rect x="0" y="0" width="3.5" height="5" rx="0.5" />
                <rect x="4.5" y="0" width="3.5" height="5" rx="0.5" />
                <rect x="9" y="0" width="3" height="5" rx="0.5" />
                <rect x="0" y="6.5" width="3.5" height="5.5" rx="0.5" />
                <rect x="4.5" y="6.5" width="3.5" height="5.5" rx="0.5" />
                <rect x="9" y="6.5" width="3" height="5.5" rx="0.5" />
              </svg>
              <span>Cuadrícula</span>
            </button>
          </div>

          {/* Botón de apertura de sobre */}
          <button
            type="button"
            onClick={onOpenPackClick}
            className="flex items-center gap-1.5 rounded-full bg-[#e2001a] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-95 transition-all"
          >
            <span aria-hidden="true">✨</span>
            <span>Abrir Sobre</span>
          </button>
        </div>
      </div>
    </header>
  );
}
