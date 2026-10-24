"use client"; // Client: Pestañas troqueladas físicas pegadas al lomo superior del álbum

import type { AlbumChapter } from "./album-types";

interface AlbumChapterTabsProps {
  readonly chapters: readonly AlbumChapter[];
  readonly currentPage: number;
  readonly onSelectPage: (page: number) => void;
}

/**
 * Pestañas troqueladas de capítulos integradas físicamente en el borde superior del álbum.
 * Emula los separadores indexados de un álbum o archivador coleccionista, ocupando
 * el ancho completo de forma proporcional sin cortes ni desbordamientos laterales.
 */
export function AlbumChapterTabs({
  chapters,
  currentPage,
  onSelectPage,
}: AlbumChapterTabsProps) {
  return (
    <nav
      aria-label="Pestañas de capítulos del álbum"
      className="relative z-10 flex w-full items-end gap-0.5 sm:gap-1 px-1 sm:px-2.5 mb-[-1px] select-none"
    >
      {chapters.map((ch) => {
        const isActive = currentPage >= ch.startPage && currentPage <= ch.endPage;

        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelectPage(ch.startPage)}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex flex-1 min-w-0 flex-col items-center justify-center rounded-t-md transition-all duration-150 ${
              isActive
                ? "bg-[#e2001a] text-white shadow-md z-20 py-1.5 sm:py-2 border-t-2 border-x-2 border-[#b30015] -translate-y-0.5 ring-1 ring-black/10"
                : "bg-[#eadbc3] text-amber-950/80 hover:bg-[#e2d0b5] hover:text-amber-950 border-t border-x border-amber-900/20 py-1 sm:py-1.5 opacity-90 hover:opacity-100 z-10"
            }`}
            title={`Ir a ${ch.label} (Pág. ${ch.startPage})`}
          >
            {/* Pespunte decorativo sutil en el borde superior de cada pestaña */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-1 top-0.5 border-t border-dashed ${
                isActive ? "border-red-300/40" : "border-amber-900/20"
              }`}
            />

            <div className="flex w-full min-w-0 flex-col items-center justify-center px-0.5 leading-tight">
              <span className="w-full truncate text-center text-[9px] sm:text-[10.5px] lg:text-xs font-bold tracking-tight">
                <span className="hidden md:inline">{ch.label}</span>
                <span className="md:hidden">{ch.shortLabel ?? ch.label}</span>
              </span>
              <span
                className={`text-[8px] sm:text-[9.5px] tabular-nums font-semibold ${
                  isActive ? "text-amber-200" : "text-amber-900/60"
                }`}
              >
                p.{ch.startPage}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
