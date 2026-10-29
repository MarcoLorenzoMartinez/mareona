"use client"; // Client: Carta interactiva de apertura con efecto flip 3D y badge de novedad

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";

interface PackRevealCardProps {
  readonly card: Card;
  readonly isNew: boolean;
  readonly isFlipped: boolean;
  readonly onFlip: () => void;
}

/**
 * Interactive card reveal slot with genuine 3D card-flip physics and status badges.
 */
export function PackRevealCard({ card, isNew, isFlipped, onFlip }: PackRevealCardProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* 3D Flip Card Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={!isFlipped ? onFlip : undefined}
        onKeyDown={(e) => {
          if (!isFlipped && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onFlip();
          }
        }}
        aria-label={isFlipped ? `${card.knownAs}, ${card.eraLabel}` : "Voltear cromo"}
        className="relative h-[250px] w-[175px] sm:h-[300px] sm:w-[210px] cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`relative h-full w-full rounded-xl transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : "hover:scale-105"
          }`}
        >
          {/* Front face (Card Back pattern before flip) */}
          <div className="absolute inset-0 flex flex-col items-center justify-between rounded-xl border border-white/20 bg-gradient-to-b from-[#e2001a] via-[#b30015] to-[#80000e] p-5 text-white shadow-2xl backface-hidden">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
              Real Sporting
            </span>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white shadow-inner">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase opacity-90">
                Memoria Rojiblanca
              </span>
            </div>
            <div className="h-1 w-6 rounded-full bg-white/40" />
          </div>

          {/* Back face (Revealed Historical Card) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white shadow-2xl rotate-y-180 backface-hidden">
            <HistoricalCard card={card} size="sm" isOwned />
          </div>
        </div>
      </div>

      {/* Status Badge below the card */}
      <div className="mt-4 h-6">
        {isFlipped && (
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold tracking-wider uppercase animate-in zoom-in-95 duration-200 ${
              isNew
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-neutral-200 text-neutral-700"
            }`}
          >
            {isNew ? "¡Nuevo en el Álbum!" : "Repetido (+1)"}
          </span>
        )}
      </div>
    </div>
  );
}
