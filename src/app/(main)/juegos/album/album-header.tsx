"use client"; // Client: Cabecera con selector de vista (Álbum / Cuadrícula) y progreso de colección

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
    <header className="flex flex-col gap-3 border-b border-[var(--border)] pb-3">
      <h1 className="sr-only">Colección de Cromos Históricos</h1>

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
                <rect x="0" y="0" width="3.5" height="3.5" rx="0.5" />
                <rect x="4.25" y="0" width="3.5" height="3.5" rx="0.5" />
                <rect x="8.5" y="0" width="3.5" height="3.5" rx="0.5" />
                <rect x="0" y="4.25" width="3.5" height="3.5" rx="0.5" />
                <rect x="4.25" y="4.25" width="3.5" height="3.5" rx="0.5" />
                <rect x="8.5" y="4.25" width="3.5" height="3.5" rx="0.5" />
                <rect x="0" y="8.5" width="3.5" height="3.5" rx="0.5" />
                <rect x="4.25" y="8.5" width="3.5" height="3.5" rx="0.5" />
                <rect x="8.5" y="8.5" width="3.5" height="3.5" rx="0.5" />
              </svg>
              <span>Cuadrícula</span>
            </button>
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
      </div>
    </header>
  );
}
