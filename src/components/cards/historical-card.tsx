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
      className={`relative flex flex-col rounded-xl border transition-all duration-150 select-none ${cardWidthClass} ${
        isSelected
          ? "border-[#e2001a] ring-2 ring-[#e2001a] shadow-md -translate-y-1"
          : "border-[var(--border)] bg-white shadow-2xs hover:border-[#e2001a]/50"
      } ${!isOwned ? "opacity-60 grayscale bg-[var(--surface)]" : ""}`}
    >
      {/* Cabecera del Cromo: Escudo Histórico y Píldora de Posición */}
      <div className="flex items-center justify-between p-2.5 pb-1.5">
        <HistoricalCrestBadge era={card.historicalCrestEra} size="sm" />
        <div className="flex items-center gap-1.5">
          {quantity > 1 && (
            <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--foreground)]">
              x{quantity}
            </span>
          )}
          <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white tracking-wide">
            {posLabel}
          </span>
        </div>
      </div>

      {/* Contenedor de Fotografía */}
      <div className="relative mx-2.5 h-36 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        {!imgError ? (
          <Image
            src={card.photoUrl}
            alt={isOwned ? `Fotografía de ${card.knownAs}` : "Cromo pendiente de desbloquear"}
            fill
            unoptimized
            sizes="(max-width: 640px) 176px, 208px"
            className="object-cover object-top"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-50 text-[#e2001a]">
            <span className="text-xl font-bold">{card.knownAs.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        {!isOwned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white backdrop-blur-[1px]">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Por descubrir</span>
          </div>
        )}
      </div>

      {/* Información del Jugador */}
      <div className="flex flex-col px-2.5 pt-2 pb-1">
        <h3 className="truncate font-bold text-[var(--foreground)] text-sm" title={card.knownAs}>
          {card.knownAs}
        </h3>
        <p className="truncate text-[11px] text-[var(--foreground-muted)]">{card.eraLabel}</p>
      </div>

      {/* Fila de Estadísticas Tabulares (PJ · ATQ · DEF · OVR) */}
      <div className="mt-auto grid grid-cols-4 divide-x divide-[var(--border)] border-t border-[var(--border)] bg-[var(--surface)]/50 py-1.5 text-center">
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[var(--foreground-muted)]">
            PJ
          </span>
          <span className="font-sans font-bold tabular-nums text-xs text-[var(--foreground)]">
            {card.matchesPlayed}
          </span>
        </div>
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[var(--foreground-muted)]">
            ATQ
          </span>
          <span className="font-sans font-bold tabular-nums text-xs text-[#e2001a]">
            {card.attackPower}
          </span>
        </div>
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[var(--foreground-muted)]">
            DEF
          </span>
          <span className="font-sans font-bold tabular-nums text-xs text-[var(--foreground)]">
            {card.defensePower}
          </span>
        </div>
        <div>
          <span className="block text-[9px] font-bold tracking-tight text-[var(--foreground-muted)]">
            OVR
          </span>
          <span className="font-sans font-bold tabular-nums text-xs text-[var(--foreground)]">
            {card.ovr}
          </span>
        </div>
      </div>
    </article>
  );
}
