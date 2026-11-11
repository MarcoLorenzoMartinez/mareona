"use client"; // Client: Cromo individual de la fila de apertura con reverso oficial, anticipación y giro 3D especial

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
 * Features concentric metallic borders before reveal and elevated 3D flip
 * physics with foil sheen sweep and impact burst for Silver/Gold cards.
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
  const isGoldHype = ovr >= 86;
  const isSilverHype = ovr >= 80 && ovr < 86;
  const isSpecial = isGoldHype || isSilverHype;
  const backTier = isGoldHype ? "gold" : isSilverHype ? "silver" : "standard";

  const glowStyle = !isRevealed
    ? isGoldHype
      ? isAnticipating
        ? "shadow-[0_0_34px_rgba(251,191,36,0.75)]"
        : "shadow-[0_0_24px_rgba(251,191,36,0.35)]"
      : isSilverHype
        ? isAnticipating
          ? "shadow-[0_0_28px_rgba(226,232,240,0.85)]"
          : "shadow-[0_0_20px_rgba(203,213,225,0.4)]"
        : ""
    : isGoldHype
      ? "shadow-[0_6px_26px_rgba(251,191,36,0.3)]"
      : isSilverHype
        ? "shadow-[0_6px_22px_rgba(148,163,184,0.3)]"
        : "";

  const popContainerClass = isRevealed
    ? isGoldHype
      ? "animate-pop-gold"
      : isSilverHype
        ? "animate-pop-silver"
        : ""
    : isAnticipating
      ? "animate-card-anticipate"
      : "";

  const flipTransitionClass = isGoldHype
    ? "transition-transform duration-900 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
    : isSilverHype
      ? "transition-transform duration-750 ease-[cubic-bezier(0.34,1.45,0.64,1)]"
      : "transition-transform duration-600 ease-out";

  return (
    <div
      className={`relative flex flex-col items-center shrink-0 select-none ${
        isAnticipating || (isRevealed && isSpecial) ? "z-20" : "z-10"
      }`}
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
        aria-label={
          isRevealed
            ? `${card.knownAs}, ${card.eraLabel}`
            : `Cromo ${index + 1} por descubrir`
        }
        className={`relative w-40 sm:w-44 aspect-[63/90] perspective-1000 transition-shadow duration-300 rounded-none ${glowStyle} ${
          !isRevealed ? "cursor-pointer hover:scale-[1.03] active:scale-[0.98]" : ""
        } ${popContainerClass}`}
      >
        {/* Onda expansiva perimetral al aterrizar una carta especial */}
        {isRevealed && isSpecial && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -inset-1.5 z-0 border-2 animate-special-burst ${
              isGoldHype ? "border-amber-400" : "border-slate-300"
            }`}
          />
        )}

        <div
          className={`relative z-10 h-full w-full transform-style-3d ${flipTransitionClass} ${
            isRevealed ? "rotate-y-180" : ""
          }`}
        >
          {/* Cara frontal: Reverso oficial de Mareona con rectángulos sutiles de rareza */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center">
            <CardBack
              size="fill"
              tier={backTier}
              title={`Cromo #${index + 1} por descubrir`}
              className="h-full w-full"
            />
          </div>

          {/* Cara trasera: Cromo histórico oficial */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center">
            <HistoricalCard card={card} size="fill" isOwned />

            {/* Barrido de brillo metálico diagonal al descubrir carta especial */}
            {isRevealed && isSpecial && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
              >
                <div
                  className={`h-full w-1/2 animate-foil-sheen bg-gradient-to-r from-transparent ${
                    isGoldHype ? "via-amber-200/60" : "via-white/65"
                  } to-transparent`}
                />
              </div>
            )}

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
