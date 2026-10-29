"use client"; // Client: Cromo individual de la fila de apertura con reverso oficial negro, halos de expectación y flip 3D

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { CardBack } from "@/components/cards/card-back";

interface PackRowCardProps {
  readonly card: Card;
  readonly isNew: boolean;
  readonly isRevealed: boolean;
  readonly isAnticipating?: boolean;
  readonly index: number;
  readonly onReveal: () => void;
}

/**
 * Individual card slot displayed side-by-side in the pack reveal modal.
 * Features hype glows before reveal:
 * - OVR >= 85: Golden pulsing halo
 * - OVR 80-84: Red sporting pulsing halo
 * - OVR < 80: Clean neutral appearance
 * Subtle "NUEVO" tag anchored at top-right corner replacing AI capsule badges.
 */
export function PackRowCard({
  card,
  isNew,
  isRevealed,
  isAnticipating = false,
  index,
  onReveal,
}: PackRowCardProps) {
  const ovr = card.ovr ?? 70;
  const isGoldHype = ovr >= 85;
  const isRedHype = ovr >= 80 && ovr < 85;

  const glowStyle = !isRevealed
    ? isGoldHype
      ? "ring-2 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.6)]"
      : isRedHype
        ? "ring-2 ring-[#e2001a] shadow-[0_0_20px_rgba(226,0,26,0.5)]"
        : ""
    : "";

  return (
    <div
      className="relative flex flex-col items-center shrink-0 select-none"
      style={{
        animation: "packCardSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        animationDelay: `${index * 80}ms`,
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
        className={`relative w-40 sm:w-44 aspect-[63/90] perspective-1000 transition-all duration-300 rounded-none ${glowStyle} ${
          !isRevealed ? "cursor-pointer hover:scale-[1.03]" : ""
        }`}
      >
        <div
          className={`relative h-full w-full transition-transform duration-700 transform-style-3d ${
            isRevealed ? "rotate-y-180" : ""
          }`}
        >
          {/* Cara frontal: Reverso oficial de Mareona */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center">
            <CardBack
              size="fill"
              title={`Cromo #${index + 1} por descubrir`}
              className="h-full w-full"
            />
          </div>

          {/* Cara trasera: Cromo histórico oficial */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center">
            <HistoricalCard
              card={card}
              size="fill"
              isOwned
            />

            {/* Micro-etiqueta sutil en la esquina superior derecha */}
            {isNew && (
              <span className="absolute top-1.5 right-1.5 z-20 rounded-full bg-[#e2001a] px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white shadow-xs">
                Nuevo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
