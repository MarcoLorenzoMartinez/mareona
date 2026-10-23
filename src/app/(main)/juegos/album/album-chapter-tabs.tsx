"use client"; // Client: Pestañas de capítulos físicos para navegación rápida entre épocas

import type { AlbumChapter } from "./album-types";

interface AlbumChapterTabsProps {
  readonly chapters: readonly AlbumChapter[];
  readonly currentPage: number;
  readonly onSelectPage: (page: number) => void;
}

/**
 * Physical index tabs protruding from the top edge of the album.
 * Emulates vintage stitched leather/cardboard chapter tabs for instant chronological jumps.
 */
export function AlbumChapterTabs({
  chapters,
  currentPage,
  onSelectPage,
}: AlbumChapterTabsProps) {
  return (
    <nav
      aria-label="Pestañas de capítulos del álbum"
      className="relative z-10 flex w-full items-end gap-1 overflow-x-auto px-4 pb-0 scrollbar-none"
    >
      {chapters.map((ch) => {
        const isActive = currentPage >= ch.startPage && currentPage <= ch.endPage;

        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelectPage(ch.startPage)}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex shrink-0 items-center justify-center rounded-t-md px-3 py-1.5 text-xs font-bold transition-all duration-150 select-none ${
              isActive
                ? "bg-[#e2001a] text-white shadow-md -translate-y-0.5 border-t-2 border-x-2 border-amber-300 ring-1 ring-black/10 z-20"
                : "bg-amber-100/80 text-amber-950/80 hover:bg-amber-200/90 hover:text-amber-950 border-t border-x border-amber-700/20 opacity-90 hover:opacity-100"
            }`}
            title={`Ir a ${ch.label} (Pág. ${ch.startPage})`}
          >
            {/* Visual stitching simulation along the tab */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-1.5 top-0.5 border-t border-dashed ${
                isActive ? "border-amber-200/60" : "border-amber-800/20"
              }`}
            />

            <span className="flex items-center gap-1.5 font-sans tracking-wide">
              <span>{ch.label}</span>
              <span
                className={`text-[9.5px] tabular-nums font-semibold ${
                  isActive ? "text-amber-200" : "text-amber-800/60"
                }`}
              >
                p.{ch.startPage}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
