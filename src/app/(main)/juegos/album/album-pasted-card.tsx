"use client"; // Client: Contenedor de cromo pegado recto y ajustado a la casilla del álbum

import { useEffect, useState, type ReactNode } from "react";

interface AlbumPastedCardProps {
  readonly children: ReactNode;
  readonly isNew?: boolean;
}

/**
 * Wraps a HistoricalCard to sit squarely and flush within its album slot.
 * Ensures zero rotation (no tilt) and strictly proportional dimensions matching the album grid cell.
 * For newly acquired cards, animates a gentle entrance.
 */
export function AlbumPastedCard({
  children,
  isNew = false,
}: AlbumPastedCardProps) {
  const [landed, setLanded] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setLanded(true), 30);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  return (
    <div
      className={`relative w-full h-full aspect-[63/90] transition-all duration-200 ${
        isNew && !landed ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Sombra plana de cromo adherido al cartón */}
      <div className="h-full w-full rounded-none shadow-[0_2px_6px_rgba(50,30,10,0.20)]">
        {children}
      </div>
    </div>
  );
}
