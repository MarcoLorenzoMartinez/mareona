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
  const photoHeightClass = size === "sm" ? "h-44" : size === "lg" ? "h-64" : "h-52";

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
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#e2001a] bg-white shadow-sm transition-all duration-150 select-none ${cardWidthClass} ${
        isSelected
          ? "ring-2 ring-offset-2 ring-[#e2001a] shadow-lg -translate-y-1"
          : "hover:shadow-md hover:-translate-y-0.5"
      } ${!isOwned ? "opacity-60 grayscale bg-neutral-50" : ""}`}
    >
      {/* Cabecera Superior: Escudo de la Época a la Izquierda y Demarcación a la Derecha */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-red-50 bg-white">
        <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
        <div className="flex items-center gap-1.5">
          {quantity > 1 && (
            <span className="rounded-full bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 text-[10px] font-bold text-neutral-800">
              x{quantity}
            </span>
          )}
          <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-2xs">
            {posLabel}
          </span>
        </div>
      </div>

      {/* Contenedor de Fotografía: Cubre todo el hueco sin espacios negros */}
      <div className={`relative w-full ${photoHeightClass} overflow-hidden bg-neutral-100`}>
        {!imgError ? (
          <Image
            src={card.photoUrl}
            alt={isOwned ? `Fotografía de ${card.knownAs}` : "Cromo pendiente de desbloquear"}
            fill
            unoptimized
            sizes="(max-width: 640px) 176px, 208px"
            className="object-cover object-top transition-transform duration-200 group-hover:scale-102"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-50 text-[#e2001a]">
            <span className="text-2xl font-black">{card.knownAs.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        {!isOwned && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-neutral-900 backdrop-blur-[1px]">
            <span className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Por descubrir
            </span>
          </div>
        )}
      </div>

      {/* Identidad del Jugador: Nombre y Época */}
      <div className="flex flex-col px-3 pt-2 pb-1.5 text-center bg-white">
        <h3 className="truncate font-black text-sm text-[var(--foreground)] tracking-tight" title={card.knownAs}>
          {card.knownAs}
        </h3>
        <p className="truncate text-[11px] font-medium text-[var(--foreground-muted)]">{card.eraLabel}</p>
      </div>

      {/* Fila de Estadísticas: PJ · DEF · ATQ · OVR (Sin espacios negros, estética Mareona) */}
      <div className="mt-auto grid grid-cols-4 divide-x divide-red-100 border-t border-red-100 bg-red-50/40 py-2 text-center">
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[var(--foreground-muted)]">
            PJ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-[var(--foreground)]">
            {card.matchesPlayed}
          </span>
        </div>
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[var(--foreground-muted)]">
            DEF
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-[var(--foreground)]">
            {card.defensePower}
          </span>
        </div>
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[#e2001a]">
            ATQ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-[#e2001a]">
            {card.attackPower}
          </span>
        </div>
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-amber-700">
            OVR
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-amber-600">
            {card.ovr}
          </span>
        </div>
      </div>
    </article>
  );
}
