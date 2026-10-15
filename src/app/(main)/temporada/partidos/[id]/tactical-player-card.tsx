// Client: Interactive tactical player card with photo fallback to club-colored disc
"use client";

import { useState } from "react";
import type {
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";

interface TacticalPlayerCardProps {
  readonly player: DomainLineupPlayer;
  readonly teamColor: string;
  readonly textColor: string;
  readonly stats: DomainPlayerMatchStats | null;
  readonly isSporting: boolean;
  readonly onSelect?: () => void;
}

export function TacticalPlayerCard({
  player,
  teamColor,
  textColor,
  stats,
  isSporting,
  onSelect,
}: TacticalPlayerCardProps) {
  const [hasError, setHasError] = useState(false);
  const showPhoto = Boolean(player.photoUrl && !hasError);

  const accessibleLabel = `${player.name}, dorsal ${player.jersey ?? "sin dorsal"}, ${
    player.subposition ?? player.positionLabel
  }${stats?.rating ? `, valoración ${stats.rating.toFixed(1)}` : ""}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={accessibleLabel}
      className="group relative flex flex-col items-center cursor-pointer text-center p-1 rounded-xl transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 min-w-[70px] max-w-[86px]"
    >
      {/* 1. Contenedor redondeado con el color del equipo */}
      <div
        className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full border-2 overflow-hidden shadow-2xs transition-shadow group-hover:shadow-md"
        style={{ borderColor: teamColor }}
      >
        {showPhoto ? (
          <>
            <div className="h-full w-full overflow-hidden bg-gradient-to-b from-white to-neutral-100 flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.photoUrl ?? ""}
                alt=""
                onError={() => setHasError(true)}
                className={`h-full w-full ${
                  isSporting
                    ? "object-contain object-bottom pt-1"
                    : "object-cover object-top"
                }`}
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* Dorsal flotante sobre la foto */}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold font-sans tabular-nums shadow-xs"
              style={{ backgroundColor: teamColor, color: textColor }}
            >
              {player.jersey ?? "-"}
            </span>
          </>
        ) : (
          /* Fallback elegante: Chapa táctica con dorsal del color del equipo */
          <div
            className="flex h-full w-full flex-col items-center justify-center font-sans font-bold tabular-nums select-none"
            style={{ backgroundColor: teamColor, color: textColor }}
          >
            <span className="text-base sm:text-lg leading-none">
              {player.jersey ?? "-"}
            </span>
          </div>
        )}

        {/* Indicador de sustitución */}
        {player.subbedOut && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-white text-[9px] font-bold shadow-2xs"
            title="Sustituido durante el partido"
            aria-hidden="true"
          >
            ↓
          </span>
        )}
      </div>

      {/* 2. Nombre del jugador debajo */}
      <span
        className={`mt-1.5 truncate text-[11px] sm:text-xs text-[var(--foreground)] w-full text-center ${
          isSporting ? "font-semibold" : "font-medium"
        }`}
      >
        {player.shortName || player.name}
      </span>

      {/* 3. Subposición táctica y valoración */}
      <div className="flex items-center gap-1 justify-center mt-0.5">
        <span className="text-[9px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
          {player.subposition ?? player.positionLabel}
        </span>
        {stats?.rating ? (
          <span className="rounded px-1 py-0.2 text-[9px] font-bold font-sans tabular-nums text-white bg-neutral-800 shadow-2xs">
            {stats.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
    </button>
  );
}
