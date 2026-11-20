"use client"; // Client: Cabecera con selector de vista (Álbum / Cuadrícula / Mis Sobres) y progreso de colección

import Link from "next/link";
import { getDictionary } from "@/i18n";

export type AlbumViewMode = "album" | "grid" | "packs";

interface AlbumHeaderProps {
  readonly ownedCount: number;
  readonly totalCount: number;
  readonly availablePacksCount: number;
  readonly viewMode: AlbumViewMode;
  readonly onViewModeChange: (mode: AlbumViewMode) => void;
}

export function AlbumHeader({
  ownedCount,
  totalCount,
  availablePacksCount,
  viewMode,
  onViewModeChange,
}: AlbumHeaderProps) {
  const dict = getDictionary();
  const progressPct = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-3 select-none">
      {/* Fila superior con botón de retorno y título unificado */}
      <div className="flex items-center gap-3">
        <Link
          href="/juegos"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
          aria-label={dict.games.album.header.backAria}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          {dict.games.album.header.title}
        </h1>
      </div>

      {/* Barra de Progreso y selector de vista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center justify-between text-xs sm:pr-4">
            <span className="font-medium text-[var(--foreground-muted)]">{dict.games.album.header.progressLabel}</span>
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

        {/* Alternador de vista: Álbum, Cuadrícula o Mis Sobres */}
        <div className="flex shrink-0 items-center">
          <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => onViewModeChange("album")}
              title={dict.games.album.header.albumViewTitle}
              aria-pressed={viewMode === "album"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all cursor-pointer ${
                viewMode === "album"
                  ? "bg-[#e2001a] text-white shadow-2xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span>{dict.games.album.header.albumViewLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              title={dict.games.album.header.gridViewTitle}
              aria-pressed={viewMode === "grid"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#e2001a] text-white shadow-2xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span>{dict.games.album.header.gridViewLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("packs")}
              title={dict.games.album.header.packsViewTitle}
              aria-pressed={viewMode === "packs"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all cursor-pointer ${
                viewMode === "packs"
                  ? "bg-[#e2001a] text-white shadow-2xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span>{dict.games.album.header.packsViewLabel}</span>
              {availablePacksCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 font-sans text-[10px] font-black tabular-nums ${
                    viewMode === "packs" ? "bg-white text-[#e2001a]" : "bg-[#e2001a] text-white"
                  }`}
                >
                  {availablePacksCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
