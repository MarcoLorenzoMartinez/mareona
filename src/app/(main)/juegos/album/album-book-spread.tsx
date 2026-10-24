"use client"; // Client: Página de álbum físico de cromos con encuadernación realista

import type { ReactNode } from "react";

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0 0.1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

interface AlbumBookSpreadProps {
  readonly children: ReactNode;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly pageTitle: string;
  readonly pageSubtitle?: string;
  readonly progress: number;
  readonly turnDirection: "next" | "prev" | "none";
  readonly onPrevPage: () => void;
  readonly onNextPage: () => void;
  readonly canPrev: boolean;
  readonly canNext: boolean;
}

/**
 * Single page of an authentic physical sticker album.
 * Renders genuine satin cream/ivory paper with paper grain texture,
 * central spine shadow, perimeter rules, and floating tactile page-turn triggers.
 */
export function AlbumBookSpread({
  children,
  pageNumber,
  totalPages,
  pageTitle,
  pageSubtitle,
  progress,
  turnDirection,
  onPrevPage,
  onNextPage,
  canPrev,
  canNext,
}: AlbumBookSpreadProps) {
  const pct = Math.round(progress * 100);

  const turnAnimationClass =
    turnDirection === "next"
      ? "animate-in slide-in-from-right-6 fade-in-80 duration-200 ease-out"
      : turnDirection === "prev"
        ? "animate-in slide-in-from-left-6 fade-in-80 duration-200 ease-out"
        : "";

  return (
    <div className="relative w-full">
      {/* Botón flotante lateral: Página anterior */}
      {canPrev && (
        <button
          type="button"
          onClick={onPrevPage}
          aria-label="Página anterior (←)"
          className="group absolute -left-2.5 sm:-left-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xl border border-neutral-300 hover:border-[#e2001a] hover:bg-[#e2001a] hover:text-white transition-all active:scale-95"
          title="Página anterior (←)"
        >
          <span className="font-sans font-black text-lg transition-transform group-hover:-translate-x-0.5">
            ‹
          </span>
        </button>
      )}

      {/* Botón flotante lateral: Página siguiente */}
      {canNext && (
        <button
          type="button"
          onClick={onNextPage}
          aria-label="Página siguiente (→)"
          className="group absolute -right-2.5 sm:-right-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xl border border-neutral-300 hover:border-[#e2001a] hover:bg-[#e2001a] hover:text-white transition-all active:scale-95"
          title="Página siguiente (→)"
        >
          <span className="font-sans font-black text-lg transition-transform group-hover:translate-x-0.5">
            ›
          </span>
        </button>
      )}

      {/* Pliego físico abierto del álbum con papel crema y textura continua */}
      <section
        key={pageNumber}
        aria-label={`Página ${pageNumber} de ${totalPages}: ${pageTitle}`}
        className={`relative w-full rounded-lg overflow-hidden border border-amber-900/15 ${turnAnimationClass}`}
        style={{
          background:
            "linear-gradient(160deg, #faf6ee 0%, #f4ecdb 35%, #efe5d1 60%, #f4ecdb 100%)",
          boxShadow:
            "0 10px 30px rgba(80,50,15,0.08), 0 2px 6px rgba(80,50,15,0.04), inset 0 0 0 1px rgba(180,140,60,0.18)",
        }}
      >
        {/* Grano auténtico de papel de imprenta */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
          style={{ backgroundImage: GRAIN_SVG }}
        />

        {/* Filete perimetral tenue de imprenta editorial clásica */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2"
          style={{ border: "1px solid rgba(160,120,50,0.20)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3"
          style={{ border: "0.5px solid rgba(160,120,50,0.12)" }}
        />

        {/* Sombra central del lomo / hendidura de encuadernación */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(80,45,10,0.08) 35%, rgba(60,30,5,0.16) 50%, rgba(80,45,10,0.08) 65%, transparent 100%)",
          }}
        />

        {/* Cabecera del pliego: Título del capítulo, subtítulo y progreso */}
        <header className="relative z-10 flex items-start justify-between px-4 sm:px-6 pt-4 pb-2 border-b border-amber-800/15">
          <div>
            <h2
              className="font-sans text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-amber-950/85"
              style={{ textShadow: "0 1px 0 rgba(255,250,235,0.8)" }}
            >
              {pageTitle}
            </h2>
            {pageSubtitle && (
              <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-amber-900/60">
                {pageSubtitle}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="font-sans text-xs font-black tabular-nums text-amber-950/85">
              Página {pageNumber} de {totalPages}
            </span>
            <span className="text-[9px] font-bold text-amber-900/60 tabular-nums">
              {pct}% completado
            </span>
          </div>
        </header>

        {/* Cuadrícula de cromos ajustados perfectamente */}
        <div className="relative z-10 p-3 sm:p-5">{children}</div>

        {/* Pie de página impreso del pliego */}
        <footer
          aria-hidden="true"
          className="relative z-10 flex items-center justify-between px-6 pb-2.5 pt-0.5 text-[8px] font-bold uppercase tracking-widest text-amber-900/40"
        >
          <span>Real Sporting · Colección Oficial</span>
          <span>Pág. {pageNumber}</span>
        </footer>
      </section>
    </div>
  );
}
