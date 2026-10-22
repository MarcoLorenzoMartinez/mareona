"use client"; // Client: Interactividad y manejo de fallback de imagen de cromo

import { useState } from "react";
import Image from "next/image";
import type { Card } from "@/lib/cards/types";
import { HistoricalCrestBadge } from "./historical-crest-badge";

export interface HistoricalCardProps {
  readonly card: Card;
  readonly isOwned?: boolean;
  readonly quantity?: number;
  readonly isSelected?: boolean;
  readonly onCardClick?: (card: Card) => void;
  readonly size?: "sm" | "md" | "lg";
}

const POSITION_LABELS = {
  goalkeeper: "POR",
  defender: "DEF",
  midfielder: "MED",
  forward: "DEL",
} as const;

export function HistoricalCard({
  card,
  isOwned = true,
  quantity = 1,
  isSelected = false,
  onCardClick,
  size = "md",
}: HistoricalCardProps) {
  const [imgError, setImgError] = useState(false);
  const posLabel = POSITION_LABELS[card.position];

  const cardWidthClass =
    size === "sm" ? "w-44 text-xs" : size === "lg" ? "w-64 text-sm" : "w-52 text-xs";
  const photoHeightClass = size === "sm" ? "h-48" : size === "lg" ? "h-68" : "h-56";

  return (
    <article
      onClick={() => onCardClick?.(card)}
      role={onCardClick ? "button" : "article"}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onCardClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onCardClick(card);
        }
      }}
      className={`group relative flex flex-col rounded-none bg-[#e2001a] p-2.5 shadow-md transition-all duration-150 select-none ${cardWidthClass} ${
        isSelected
          ? "ring-4 ring-black/80 shadow-xl -translate-y-1.5"
          : "hover:shadow-xl hover:-translate-y-1"
      } ${!isOwned ? "opacity-60 grayscale" : ""}`}
    >
      {/* Cabecera Superior Integrada en el Borde Rojo: Escudo Histórico y Demarcación */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-white p-0.5 shadow-xs border border-white/40">
          <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
        </div>
        <div className="flex items-center gap-1.5">
          {quantity > 1 && (
            <span className="rounded-none bg-black/80 px-1.5 py-0.5 text-[9px] font-black text-white uppercase border border-white/30">
              x{quantity}
            </span>
          )}
          <span className="rounded-none bg-white px-2 py-0.5 text-[10px] font-black tracking-wider text-[#e2001a] uppercase shadow-xs">
            {posLabel}
          </span>
        </div>
      </div>

      {/* Marco Interior de la Imagen: Fotografía a Cuerpo Completo Enmarcada por el Borde Rojo */}
      <div
        className={`relative w-full ${photoHeightClass} overflow-hidden rounded-none border-2 border-white bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 shadow-inner`}
      >
        {!imgError ? (
          <Image
            src={card.photoUrl}
            alt={isOwned ? `Cromo de ${card.knownAs}` : "Cromo pendiente de desbloquear"}
            fill
            unoptimized
            sizes="(max-width: 640px) 176px, 208px"
            className="object-contain object-bottom p-1 drop-shadow-sm transition-transform duration-200 group-hover:scale-102"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-50 text-[#e2001a]">
            <span className="text-3xl font-black">{card.knownAs.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        {!isOwned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white backdrop-blur-[1px]">
            <span className="rounded-none border border-white bg-black/80 px-2 py-1 text-[10px] font-black tracking-widest uppercase">
              Por descubrir
            </span>
          </div>
        )}
      </div>

      {/* Identidad del Jugador Integrada en el Borde Rojo Grueso */}
      <div className="flex flex-col px-1 pt-2 pb-1.5 text-center">
        <h3
          className="truncate font-black text-sm text-white tracking-wider uppercase drop-shadow-xs"
          title={card.knownAs}
        >
          {card.knownAs}
        </h3>
        <p className="truncate text-[10px] font-bold text-white/85 tracking-tight">{card.eraLabel}</p>
      </div>

      {/* Estadísticas Integradas en el Borde Rojo (Panini Style: Bloques Rectangulares Nítidos) */}
      <div className="mt-auto grid grid-cols-4 gap-1 pt-1">
        <div className="rounded-none bg-white py-1 text-center shadow-2xs border border-white/60">
          <span className="block text-[8px] font-black tracking-tight text-neutral-500 uppercase">
            PJ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-neutral-900">
            {card.matchesPlayed}
          </span>
        </div>
        <div className="rounded-none bg-white py-1 text-center shadow-2xs border border-white/60">
          <span className="block text-[8px] font-black tracking-tight text-neutral-500 uppercase">
            DEF
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-neutral-900">
            {card.defensePower}
          </span>
        </div>
        <div className="rounded-none bg-white py-1 text-center shadow-2xs border border-white/60">
          <span className="block text-[8px] font-black tracking-tight text-[#e2001a] uppercase">
            ATQ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-[#e2001a]">
            {card.attackPower}
          </span>
        </div>
        <div className="rounded-none bg-amber-400 py-1 text-center shadow-2xs border border-amber-300">
          <span className="block text-[8px] font-black tracking-tight text-amber-950 uppercase">
            OVR
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-neutral-950">
            {card.ovr}
          </span>
        </div>
      </div>
    </article>
  );
}
