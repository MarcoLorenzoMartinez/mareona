"use client"; // Client: Interactividad y estado visual de cromo coleccionable

import { useState } from "react";
import Image from "next/image";
import type { Card } from "@/lib/cards/types";
import { HistoricalCrestBadge } from "./historical-crest-badge";
import { CardStadiumBackground } from "./card-stadium-background";
import { CardStatsHud } from "./card-stats-hud";

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
      className={`group relative flex flex-col justify-between rounded-none p-1.5 sm:p-2 shadow-lg transition-all duration-150 select-none aspect-[63/90] ${cardWidthClass} ${
        isSelected
          ? "ring-4 ring-amber-400 shadow-2xl -translate-y-1.5"
          : "hover:shadow-2xl hover:-translate-y-1"
      } ${
        isOwned
          ? "bg-[#e2001a] border-2 border-amber-300/80"
          : "bg-gradient-to-b from-[#5c030b] to-[#2d0105] border-2 border-amber-800/40"
      }`}
    >
      {/* 1. Cabecera Heritage: Escudo Histórico y Demarcación */}
      <div className="relative z-10 flex shrink-0 items-center justify-between pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-none bg-white p-0.5 border border-amber-300 shadow-xs">
          <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
        </div>
        <div className="flex items-center gap-1.5">
          {quantity > 1 && (
            <span className="rounded-none bg-black/85 px-1.5 py-0.5 text-[8.5px] font-black text-amber-300 uppercase border border-amber-300/40">
              x{quantity}
            </span>
          )}
          <span className="rounded-none bg-white px-2 py-0.5 text-[10px] font-black tracking-wider text-[#e2001a] uppercase shadow-xs border border-amber-300/40">
            {posLabel}
          </span>
        </div>
      </div>

      {/* 2. Ventana Central Biselada de Retrato (The Heritage Window) */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-none border-2 border-white/90 bg-neutral-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
        {/* Fondo sutil de El Molinón integrado con armonía */}
        <CardStadiumBackground isOwned={isOwned} />

        {!imgError ? (
          <Image
            src={card.photoUrl}
            alt={isOwned ? `Cromo de ${card.knownAs}` : "Cromo pendiente de desbloquear"}
            fill
            unoptimized
            sizes="(max-width: 640px) 176px, 208px"
            className={`transition-transform duration-200 group-hover:scale-105 object-cover object-[center_20%] ${
              !isOwned ? "opacity-35 brightness-50" : ""
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-950 text-white">
            <span className="text-3xl font-black">{card.knownAs.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        {/* Filete interior sutil de marco de cuadro */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-400/30" />

        {/* Overlay clásico para cromo "Por descubrir" */}
        {!isOwned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-400/80 bg-neutral-950/80 text-amber-300 shadow-xl">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="mt-2 border border-amber-400/60 bg-neutral-950/90 px-2 py-0.5 text-[8.5px] font-black tracking-widest text-amber-300 uppercase shadow-md">
              Por descubrir
            </span>
          </div>
        )}
      </div>

      {/* 3. Placa Inferior de Nombre y Cuadrícula de 4 Estadísticas */}
      <CardStatsHud
        knownAs={card.knownAs}
        matchesPlayed={card.matchesPlayed}
        defensePower={card.defensePower}
        attackPower={card.attackPower}
        ovr={card.ovr}
        isOwned={isOwned}
      />
    </article>
  );
}
