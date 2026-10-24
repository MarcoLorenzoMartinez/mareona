"use client"; // Client: Contenedor de cromo pegado con animación física y brillo satinado

import type { ReactNode } from "react";

interface AlbumPastedCardProps {
  readonly children: ReactNode;
  readonly isNew?: boolean;
}

/**
 * Wraps a HistoricalCard to sit squarely and flush within its album slot.
 * Ensures strictly proportional dimensions matching the album grid cell,
 * physical sticking animation for newly acquired cards, and a subtle satin gloss sheen.
 */
export function AlbumPastedCard({
  children,
  isNew = false,
}: AlbumPastedCardProps) {
  return (
    <div
      className={`relative w-full h-full aspect-[63/90] ${
        isNew ? "animate-sticker-stick" : ""
      }`}
    >
      {/* Sombra plana de cromo adherido al cartón */}
      <div className="h-full w-full rounded-none shadow-[0_2px_6px_rgba(50,30,10,0.20)]">
        {children}
      </div>

      {/* Brillo tenue de cromo satinado */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.22) 0%, transparent 35%, transparent 70%, rgba(255,255,255,0.10) 100%)",
        }}
      />
    </div>
  );
}
