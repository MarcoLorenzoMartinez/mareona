"use client"; // Client: Interactividad y estado visual de cromo coleccionable

import { useState } from "react";
import Image from "next/image";
import type { Card } from "@/lib/cards/types";
import { HistoricalCrestBadge } from "./historical-crest-badge";
import { CardStadiumBackground } from "./card-stadium-background";
import { CardStatsHud } from "./card-stats-hud";
import { CardCommemorativeHud } from "./card-commemorative-hud";
import { CardBack } from "./card-back";

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
  isSelected = false,
  onCardClick,
  size = "md",
}: HistoricalCardProps) {
  const [imgError, setImgError] = useState(false);

  // Si el usuario aún no posee el cromo, se muestra el reverso oficial de Mareona (negro con la ola blanca)
  if (!isOwned) {
    return (
      <CardBack
        size={size}
        isSelected={isSelected}
        onClick={onCardClick ? () => onCardClick(card) : undefined}
        title="Cromo por descubrir"
      />
    );
  }

  const isCommemorative =
    card.kind === "crest" || card.kind === "moment" || card.kind === "coach";
  const badgeLabel =
    card.kind === "crest"
      ? "ESCUDO"
      : card.kind === "moment"
        ? "MOMENTO"
        : card.kind === "coach"
          ? "MÍSTER"
          : card.position
            ? POSITION_LABELS[card.position]
            : "JUG";

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
      } bg-[#e2001a] border-2 border-amber-300/80`}
    >
      {/* 1. Cabecera Heritage: Escudo Histórico y Demarcación / Tipo */}
      <div className="relative z-10 flex shrink-0 items-center justify-between pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-none bg-white p-0.5 border border-amber-300 shadow-xs">
          <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
        </div>
        <span className="rounded-none bg-white px-2 py-0.5 text-[10px] font-black tracking-wider text-[#e2001a] uppercase shadow-xs border border-amber-300/40">
          {badgeLabel}
        </span>
      </div>

      {/* 2. Ventana Central Biselada de Retrato (The Heritage Window) */}
      <div
        className={`relative w-full flex-1 min-h-0 overflow-hidden rounded-none border-2 border-white/90 ${
          card.kind === "crest"
            ? "bg-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.12)]"
            : "bg-neutral-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]"
        }`}
      >
        {card.kind !== "crest" && <CardStadiumBackground isOwned={true} />}

        {!imgError ? (
          <Image
            src={card.photoUrl}
            alt={`Cromo de ${card.knownAs}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 176px, 208px"
            className={`transition-transform duration-200 group-hover:scale-105 ${
              card.kind === "crest"
                ? "object-contain p-3.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                : "object-cover object-[center_20%]"
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center text-white p-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400/80 bg-neutral-950/80 shadow-lg">
              <span className="text-lg font-black tracking-widest text-amber-300">
                {card.knownAs.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="mt-1 text-[8.5px] font-bold text-white/90 uppercase tracking-wider line-clamp-1">
              {card.knownAs}
            </span>
          </div>
        )}

        {/* Filete interior sutil de marco de cuadro */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-400/30" />
      </div>

      {/* 3. Placa Inferior: Conmemorativa o Cuadrícula de 4 Estadísticas */}
      {isCommemorative ? (
        <CardCommemorativeHud
          title={card.knownAs}
          subtitle={
            card.kind === "crest" || card.kind === "coach"
              ? card.eraLabel
              : card.year
                ? `${card.year}`
                : card.eraLabel
          }
          kind={card.kind ?? "coach"}
        />
      ) : (
        <CardStatsHud
          knownAs={card.knownAs}
          matchesPlayed={card.matchesPlayed ?? 0}
          defensePower={card.defensePower ?? 50}
          attackPower={card.attackPower ?? 50}
          ovr={card.ovr ?? 50}
          isOwned={true}
        />
      )}
    </article>
  );
}
