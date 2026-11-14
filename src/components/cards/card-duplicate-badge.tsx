"use client"; // Client: Distintivo editorial para volumen de repetidos y estado de cromo duplicado

import React from "react";

interface CardDuplicateBadgeProps {
  readonly duplicateCount: number;
}

/**
 * Editorial badge displaying the surplus duplicate count (xN) in card collection views.
 * Strictly adheres to clean typography, tabular numbers, and corporate red accents.
 */
export function CardDuplicateBadge({ duplicateCount }: CardDuplicateBadgeProps) {
  if (duplicateCount <= 0) return null;

  return (
    <div
      aria-label={`${duplicateCount} cromos repetidos en el taco`}
      title={`${duplicateCount} repetidos`}
      className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 rounded-full border border-neutral-800/80 bg-neutral-950/85 px-1.5 py-0.5 shadow-md backdrop-blur-2xs"
    >
      {/* Icono vectorial sutil de doble cromo / taco de cartas */}
      <svg
        className="h-2.5 w-2.5 text-neutral-300"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 2a1 1 0 0 0-1 1v7h1.5V3.5h7V2H4z" />
        <path d="M6 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6zm1 1.5h6v7.5H7V6.5z" />
      </svg>
      <span className="font-sans text-[9px] font-black tabular-nums tracking-tight text-white leading-none">
        x{duplicateCount}
      </span>
    </div>
  );
}

/**
 * Editorial subtle tag indicating a newly revealed duplicate card during pack opening.
 */
export function CardPackDuplicateTag() {
  return (
    <div
      aria-label="Cromo repetido"
      className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 rounded-full border border-neutral-900/60 bg-neutral-900/85 px-1.5 py-0.5 shadow-xs backdrop-blur-2xs animate-in fade-in zoom-in-95 duration-200"
    >
      <svg
        className="h-2.5 w-2.5 text-neutral-300"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 2a1 1 0 0 0-1 1v7h1.5V3.5h7V2H4z" />
        <path d="M6 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6zm1 1.5h6v7.5H7V6.5z" />
      </svg>
      <span className="font-sans text-[8.5px] font-bold uppercase tracking-wider text-neutral-200 leading-none">
        Repetido
      </span>
    </div>
  );
}
