"use client"; // Client: Cromo individual de la fila de apertura con reverso oficial negro y flip 3D

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { CardBack } from "@/components/cards/card-back";

interface PackRowCardProps {
  readonly card: Card;
  readonly isNew: boolean;
  readonly isRevealed: boolean;
  readonly index: number;
  readonly onReveal: () => void;
}

/**
 * Individual card slot displayed side-by-side in the pack reveal modal.
 * Uses the authentic official Mareona card back before reveal and the official HistoricalCard upon flip.
 */
export function PackRowCard({
  card,
  isNew,
  isRevealed,
  index,
  onReveal,
}: PackRowCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-2.5 shrink-0 select-none"
      style={{
        animation: "packCardSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* 3D Flip Card Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={!isRevealed ? onReveal : undefined}
        onKeyDown={(e) => {
          if (!isRevealed && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onReveal();
          }
        }}
        aria-label={isRevealed ? `${card.knownAs}, ${card.eraLabel}` : `Cromo ${index + 1} por descubrir`}
        className={`relative w-40 sm:w-44 aspect-[63/90] perspective-1000 transition-transform duration-200 ${
          !isRevealed ? "cursor-pointer hover:scale-[1.03]" : ""
        }`}
      >
        <div
          className={`relative h-full w-full transition-transform duration-700 transform-style-3d ${
            isRevealed ? "rotate-y-180" : ""
          }`}
        >
          {/* Cara frontal: Reverso oficial auténtico de Mareona (negro con la ola blanca) */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center">
            <CardBack
              size="fill"
              title={`Cromo #${index + 1} por descubrir`}
              className="h-full w-full"
            />
          </div>

          {/* Cara trasera: Cromo histórico oficial de Mareona */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center">
            <HistoricalCard
              card={card}
              size="fill"
              isOwned
            />
          </div>
        </div>
      </div>

      {/* Badge de estado debajo del cromo */}
      <div className="h-6 flex items-center justify-center">
        {isRevealed ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-in zoom-in-95 duration-200 ${
              isNew
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
            }`}
          >
            {isNew ? "¡Nuevo!" : "Repetido"}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-neutral-400">
            #{index + 1}
          </span>
        )}
      </div>
    </div>
  );
}
