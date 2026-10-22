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
  const isCutout = card.photoUrl.endsWith(".png");

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
      className={`group relative flex flex-col justify-between overflow-hidden rounded-none shadow-xl transition-all duration-150 select-none aspect-[63/90] ${cardWidthClass} ${
        isSelected
          ? "ring-4 ring-amber-400 shadow-2xl -translate-y-1.5"
          : "hover:shadow-2xl hover:-translate-y-1"
      } border-2 ${isOwned ? "border-amber-400/90" : "border-amber-700/50"}`}
    >
      {/* 1. Fondo Deportivo a Sangre: El Molinón con focos e iluminación nocturna */}
      <CardStadiumBackground isLegend={!isCutout} />

      {/* 2. Cabecera Superior: Sello Metálico con Escudo de la Época y Demarcación */}
      <div className="relative z-10 flex shrink-0 items-center justify-between p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1 border-2 border-amber-400 shadow-md">
          <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
        </div>
        <div className="flex items-center gap-1.5">
          {quantity > 1 && (
            <span className="rounded-none bg-neutral-950/90 px-1.5 py-0.5 text-[8.5px] font-black text-amber-300 uppercase border border-amber-400/50 shadow-xs">
              x{quantity}
            </span>
          )}
          <span className="rounded-none bg-neutral-950/90 px-2 py-0.5 text-[10px] font-black tracking-wider text-amber-300 uppercase border border-amber-400/50 shadow-xs">
            {posLabel}
          </span>
        </div>
      </div>

      {/* 3. Escenario Central: Silueta Atlética (Modernos) o Prisma Dorado (Leyendas) */}
      <div className="relative z-0 flex flex-1 w-full min-h-0 items-end justify-center px-2 pb-1">
        {!imgError ? (
          isCutout ? (
            /* Jugador Moderno en Silueta Recortada apoyada sobre El Molinón */
            <div className="relative h-full w-full">
              <Image
                src={card.photoUrl}
                alt={isOwned ? `Cromo de ${card.knownAs}` : "Cromo pendiente de desbloquear"}
                fill
                unoptimized
                sizes="(max-width: 640px) 180px, 220px"
                className={`object-contain object-bottom drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:scale-105 ${
                  !isOwned ? "opacity-30 brightness-50" : ""
                }`}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            /* Leyenda Histórica de Archivo: Retrato Nítido en Prisma Dorado Adrenalyn */
            <div className="relative mb-1 flex flex-col items-center">
              <span className="mb-0.5 rounded-none bg-amber-400 px-2 py-0.5 text-[8px] font-black tracking-widest text-neutral-950 uppercase shadow-xs">
                Leyenda
              </span>
              <div
                className={`relative h-32 w-28 sm:h-36 sm:w-32 overflow-hidden border-2 border-amber-400 bg-neutral-950 shadow-[0_0_16px_rgba(245,158,11,0.35)] ${
                  !isOwned ? "opacity-30 brightness-50" : ""
                }`}
              >
                <Image
                  src={card.photoUrl}
                  alt={isOwned ? `Cromo de ${card.knownAs}` : "Cromo pendiente de desbloquear"}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 140px, 160px"
                  className="object-cover object-top transition-transform duration-200 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-300/40" />
              </div>
            </div>
          )
        ) : (
          <div className="flex h-28 w-28 items-center justify-center bg-red-950 text-white border border-amber-400">
            <span className="text-3xl font-black">{card.knownAs.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        {/* Overlay Mítico para Cromos "Por Descubrir" */}
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
            <span className="mt-2 border border-amber-400/70 bg-neutral-950/90 px-2 py-0.5 text-[8.5px] font-black tracking-widest text-amber-300 uppercase shadow-md">
              Por descubrir
            </span>
          </div>
        )}
      </div>

      {/* 4. Pie de Cromo: Barra HUD Unificada (Identidad + Telemetría de Estadísticas) */}
      <CardStatsHud
        knownAs={card.knownAs}
        eraLabel={card.eraLabel}
        matchesPlayed={card.matchesPlayed}
        defensePower={card.defensePower}
        attackPower={card.attackPower}
        ovr={card.ovr}
        isOwned={isOwned}
      />
    </article>
  );
}
