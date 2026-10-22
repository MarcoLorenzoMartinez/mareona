"use client"; // Client: Interactividad y manejo de fallback de imagen de cromo

import { useState } from "react";
import Image from "next/image";
import type { Card } from "@/lib/cards/types";
import { HistoricalCrestBadge } from "./historical-crest-badge";
import { MiniPitchPosition } from "./mini-pitch-position";

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
    size === "sm" ? "w-48 h-72 text-xs" : size === "lg" ? "w-64 h-96 text-sm" : "w-56 h-84 text-xs";

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
      className={`group relative flex flex-col overflow-hidden rounded-xl border-4 border-white bg-neutral-900 p-1 shadow-md transition-all duration-150 select-none ${cardWidthClass} ${
        isSelected
          ? "ring-3 ring-[#e2001a] shadow-xl -translate-y-1"
          : "hover:shadow-lg hover:-translate-y-0.5"
      } ${!isOwned ? "opacity-60 grayscale" : ""}`}
    >
      {/* Marco Exterior Rojiblanco Adrenalyn XL */}
      <div className="relative flex h-full w-full overflow-hidden rounded-lg border-2 border-[#e2001a] bg-neutral-950">
        {/* Fondo Dinámico de Estadio y Luces */}
        <div className="absolute inset-0 bg-radial from-red-950/40 via-neutral-900 to-black" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e2001a_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Franja Vertical Izquierda Estilo Adrenalyn (Escudo + Nombre en Vertical) */}
        <div className="relative z-20 flex w-10 flex-col items-center justify-between border-r border-[#e2001a]/60 bg-gradient-to-b from-[#b30015] via-[#e2001a] to-neutral-950 py-2 shadow-md">
          {/* Medallón de Escudo Histórico */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white shadow-xs">
            <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
          </div>

          {/* Nombre del Jugador en Tipografía Vertical Atlética */}
          <div className="my-auto flex items-center justify-center py-2">
            <span
              className="text-xs font-black tracking-widest text-white uppercase [writing-mode:vertical-rl] rotate-180 drop-shadow-sm select-none"
              title={card.knownAs}
            >
              {card.knownAs}
            </span>
          </div>

          {/* Posición Táctica Base */}
          <span className="rounded-xs bg-black/80 px-1 py-0.5 text-[9px] font-black tracking-wider text-white uppercase border border-white/30">
            {posLabel}
          </span>
        </div>

        {/* Zona Central: Fotografía del Jugador a Escala Completa */}
        <div className="relative flex-1">
          {/* Cabecera Superior Derecha: Años y Cantidad */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            {quantity > 1 && (
              <span className="rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-black text-black shadow-xs">
                x{quantity}
              </span>
            )}
            <span className="rounded-sm bg-black/70 px-1.5 py-0.5 font-sans font-bold tabular-nums text-[10px] text-white/90 border border-white/20">
              {card.eraLabel.split("–")[0]?.trim() ?? "1905"}
            </span>
          </div>

          {/* Retrato del Jugador */}
          <div className="relative h-full w-full pb-14">
            {!imgError ? (
              <Image
                src={card.photoUrl}
                alt={isOwned ? `Cromo de ${card.knownAs}` : "Cromo por descubrir"}
                fill
                unoptimized
                sizes="(max-width: 640px) 192px, 256px"
                className="object-contain object-bottom drop-shadow-md transition-transform duration-200 group-hover:scale-102"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#e2001a]">
                <span className="text-3xl font-black">{card.knownAs.slice(0, 2).toUpperCase()}</span>
              </div>
            )}

            {!isOwned && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white backdrop-blur-[1px]">
                <span className="text-[11px] font-black tracking-widest uppercase border border-white/40 px-2 py-1 bg-black/40">
                  Bloqueado
                </span>
              </div>
            )}
          </div>

          {/* Consola de Combate Inferior Estilo Adrenalyn XL */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-[#e2001a]/70 bg-gradient-to-t from-neutral-950 via-neutral-900 to-neutral-900/90 p-1.5">
            {/* Bloque DEF */}
            <div className="flex flex-col items-center justify-center rounded-xs border border-white/20 bg-neutral-800 px-1.5 py-0.5 min-w-[34px]">
              <span className="text-[8px] font-black tracking-tighter text-white/70">DEF</span>
              <span className="font-sans font-black tabular-nums text-xs text-white">
                {card.defensePower}
              </span>
            </div>

            {/* Bloque ATQ */}
            <div className="flex flex-col items-center justify-center rounded-xs border border-red-500/50 bg-[#e2001a] px-1.5 py-0.5 min-w-[34px] shadow-xs">
              <span className="text-[8px] font-black tracking-tighter text-white/90">ATQ</span>
              <span className="font-sans font-black tabular-nums text-xs text-white">
                {card.attackPower}
              </span>
            </div>

            {/* Bloque OVR / Total */}
            <div className="flex flex-col items-center justify-center rounded-xs border border-amber-400/60 bg-amber-500/20 px-1.5 py-0.5 min-w-[34px]">
              <span className="text-[8px] font-black tracking-tighter text-amber-300">OVR</span>
              <span className="font-sans font-black tabular-nums text-xs text-amber-200">
                {card.ovr}
              </span>
            </div>

            {/* Diagrama de Posición en Terreno de Juego */}
            <MiniPitchPosition position={card.position} className="h-7 w-6 shrink-0" />
          </div>
        </div>
      </div>
    </article>
  );
}
