"use client"; // Client: Contenedor con encuadernación de libro y animación de pase de página

import type { ReactNode } from "react";

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
 * Renders the physical hardcover album binding with central spine, 3D page turn,
 * and edge page-turn click zones.
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

  // CSS class for 3D page curl/flip animation
  const turnAnimationClass =
    turnDirection === "next"
      ? "animate-in slide-in-from-right-8 fade-in-80 duration-250 ease-out"
      : turnDirection === "prev"
        ? "animate-in slide-in-from-left-8 fade-in-80 duration-250 ease-out"
        : "";

  return (
    <div className="relative w-full rounded-md bg-[#24190f] p-2 sm:p-3 md:p-4 shadow-2xl border-4 border-[#3d2c1d] ring-1 ring-black/40">
      {/* Corner metallic brass braces (classic antique collector album corners) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-amber-400/60 rounded-tl-sm"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-amber-400/60 rounded-tr-sm"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-amber-400/60 rounded-bl-sm"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-amber-400/60 rounded-br-sm"
      />

      {/* Edge page-turn trigger: Left */}
      {canPrev && (
        <button
          type="button"
          onClick={onPrevPage}
          aria-label="Pasar a página anterior"
          className="group absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-8 sm:w-9 items-center justify-center rounded-l-md bg-[#e2001a] text-white shadow-xl hover:bg-[#b30015] hover:scale-105 active:scale-95 transition-all border border-amber-300/40"
        >
          <span className="font-sans font-black text-lg transition-transform group-hover:-translate-x-0.5">
            ‹
          </span>
        </button>
      )}

      {/* Edge page-turn trigger: Right */}
      {canNext && (
        <button
          type="button"
          onClick={onNextPage}
          aria-label="Pasar a página siguiente"
          className="group absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-8 sm:w-9 items-center justify-center rounded-r-md bg-[#e2001a] text-white shadow-xl hover:bg-[#b30015] hover:scale-105 active:scale-95 transition-all border border-amber-300/40"
        >
          <span className="font-sans font-black text-lg transition-transform group-hover:translate-x-0.5">
            ›
          </span>
        </button>
      )}

      {/* Main paper sheet spread */}
      <section
        key={pageNumber}
        aria-label={`Página ${pageNumber} de ${totalPages}: ${pageTitle}`}
        className={`relative w-full rounded-sm overflow-hidden ${turnAnimationClass}`}
        style={{
          background:
            "linear-gradient(160deg, #f7f2e6 0%, #eee5d0 35%, #e8ddc4 60%, #eee5d0 100%)",
          boxShadow:
            "0 6px 20px rgba(50,30,10,0.25), inset 0 0 0 1px rgba(180,140,60,0.25)",
        }}
      >
        {/* Double perimeter margin rule */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2"
          style={{ border: "1px solid rgba(160,120,50,0.25)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3"
          style={{ border: "0.5px solid rgba(160,120,50,0.15)" }}
        />

        {/* Realistic spine crease / gutter shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(60,30,0,0.12) 35%, rgba(40,20,0,0.22) 50%, rgba(60,30,0,0.12) 65%, transparent 100%)",
          }}
        />

        {/* Page header */}
        <header className="relative z-10 flex items-start justify-between px-4 sm:px-6 pt-4 pb-2 border-b border-amber-700/15">
          <div>
            <h2
              className="font-sans text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-amber-950/85"
              style={{ textShadow: "0 1px 0 rgba(255,245,220,0.6)" }}
            >
              {pageTitle}
            </h2>
            {pageSubtitle && (
              <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-amber-800/60">
                {pageSubtitle}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="font-sans text-xs font-black tabular-nums text-amber-950/80">
              Página {pageNumber} de {totalPages}
            </span>
            <span className="text-[9px] font-bold text-amber-800/60 tabular-nums">
              {pct}% completado
            </span>
          </div>
        </header>

        {/* 12-Card Grid Canvas */}
        <div className="relative z-10 p-3 sm:p-5">{children}</div>

        {/* Page footer stamp */}
        <footer
          aria-hidden="true"
          className="relative z-10 flex items-center justify-between px-6 pb-2.5 pt-1 text-[8px] font-bold uppercase tracking-widest text-amber-900/40"
        >
          <span>Real Sporting de Gijón · Álbum Oficial</span>
          <span>Pág. {pageNumber}</span>
        </footer>
      </section>
    </div>
  );
}
