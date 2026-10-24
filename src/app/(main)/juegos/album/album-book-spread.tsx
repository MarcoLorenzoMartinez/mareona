"use client"; // Client: Pliego abierto de álbum físico de cromos con 9 cromos a la izquierda y 9 a la derecha

import type { ReactNode } from "react";

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0.1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

interface AlbumBookSpreadProps {
  readonly leftPage: ReactNode;
  readonly rightPage?: ReactNode;
  readonly mobilePage?: ReactNode;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly turnDirection: "next" | "prev" | "none";
  readonly onPrevPage: () => void;
  readonly onNextPage: () => void;
  readonly canPrev: boolean;
  readonly canNext: boolean;
}

/**
 * Open double-page spread of an authentic sticker album.
 * Renders genuine satin cream pages, central spine crease, paper grain texture,
 * and 9 cards on the left plus 9 cards on the right.
 */
export function AlbumBookSpread({
  leftPage,
  rightPage,
  mobilePage,
  pageNumber,
  totalPages,
  turnDirection,
  onPrevPage,
  onNextPage,
  canPrev,
  canNext,
}: AlbumBookSpreadProps) {
  const turnAnimationClass =
    turnDirection === "next"
      ? "animate-in slide-in-from-right-6 fade-in-80 duration-200 ease-out"
      : turnDirection === "prev"
        ? "animate-in slide-in-from-left-6 fade-in-80 duration-200 ease-out"
        : "";

  return (
    <div className="relative w-full">
      {/* Botón flotante lateral: Página/Pliego anterior */}
      {canPrev && (
        <button
          type="button"
          onClick={onPrevPage}
          aria-label="Pliego anterior (←)"
          className="group absolute -left-2.5 sm:-left-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xl border border-neutral-300 hover:border-[#e2001a] hover:bg-[#e2001a] hover:text-white transition-all active:scale-95"
          title="Pliego anterior (←)"
        >
          <span className="font-sans font-black text-lg transition-transform group-hover:-translate-x-0.5">
            ‹
          </span>
        </button>
      )}

      {/* Botón flotante lateral: Página/Pliego siguiente */}
      {canNext && (
        <button
          type="button"
          onClick={onNextPage}
          aria-label="Pliego siguiente (→)"
          className="group absolute -right-2.5 sm:-right-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-800 shadow-xl border border-neutral-300 hover:border-[#e2001a] hover:bg-[#e2001a] hover:text-white transition-all active:scale-95"
          title="Pliego siguiente (→)"
        >
          <span className="font-sans font-black text-lg transition-transform group-hover:translate-x-0.5">
            ›
          </span>
        </button>
      )}

      {/* Pliego físico abierto del álbum con textura de papel y hendidura central */}
      <section
        key={pageNumber}
        aria-label={`Páginas ${pageNumber} y ${Math.min(totalPages, pageNumber + 1)} de ${totalPages}`}
        className={`relative w-full rounded-xl overflow-hidden border border-amber-900/20 ${turnAnimationClass}`}
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

        {/* Sombra central del lomo / hendidura de encuadernación (divide página izquierda y derecha) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 hidden md:block z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(80,45,10,0.08) 35%, rgba(60,30,5,0.18) 50%, rgba(80,45,10,0.08) 65%, transparent 100%)",
          }}
        />

        {/* Vista Escritorio / Tablet: 9 cromos a la izquierda y 9 cromos a la derecha */}
        <div className="relative z-10 hidden md:grid md:grid-cols-2 divide-x divide-transparent">
          <div className="p-3 sm:p-5 pr-4 md:pr-7">{leftPage}</div>
          <div className="p-3 sm:p-5 pl-4 md:pl-7">{rightPage ?? leftPage}</div>
        </div>

        {/* Vista Móvil (< md): Página individual para lectura y ergonomía táctil */}
        <div className="relative z-10 block md:hidden p-3 sm:p-4">
          {mobilePage ?? leftPage}
        </div>
      </section>
    </div>
  );
}
