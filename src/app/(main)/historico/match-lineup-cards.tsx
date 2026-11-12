// Client: Componentes atómicos para tarjetas de titulares y filas de banquillo
"use client";

import type { HistoricalMatchPlayer } from "@/lib/historical/types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface StarterCardProps {
  readonly player: HistoricalMatchPlayer;
  readonly teamColor: string;
}

/**
 * Compact vertical player card displaying bust photo or avatar fallback, and alias.
 * Calibrated uniform dimensions (48px mobile / 60px desktop) so all tactical lines
 * (including 5 players) share identical scale and fit cleanly on mobile screens.
 */
export function StarterCard({ player, teamColor }: StarterCardProps) {
  return (
    <div className="flex flex-col items-center justify-start text-center py-1 px-0.5 shrink-0 select-none w-[58px] sm:w-[76px]">
      <div
        className="relative flex items-center justify-center rounded-full p-0.5 border-2 shadow-xs bg-white shrink-0"
        style={{ borderColor: teamColor }}
      >
        <PlayerPhoto
          photoUrl={player.photoUrl}
          playerName={player.name}
          size="custom"
          teamColor={teamColor}
          className="h-12 w-12 sm:h-15 sm:w-15 rounded-full object-cover object-top shrink-0"
        />
      </div>
      <span
        className="font-semibold text-neutral-800 truncate max-w-full text-center mt-1 px-0.5 leading-tight block text-[10px] sm:text-xs"
        title={player.name}
      >
        {player.name}
      </span>
    </div>
  );
}

interface BenchRowProps {
  readonly player: HistoricalMatchPlayer;
  readonly teamColor: string;
}

/**
 * Clean official roster row for substitute bench players.
 * Non-interactive row with industry-standard substitution indicator (green entry arrow).
 */
export function BenchRow({ player, teamColor }: BenchRowProps) {
  const played = player.subIn !== undefined;
  return (
    <div
      className="flex items-center justify-between py-1 px-1.5 text-xs select-none"
      title={played ? `Jugó (entró en el minuto ${player.subIn})` : "Suplente sin minutos"}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <PlayerPhoto
          photoUrl={player.photoUrl}
          playerName={player.name}
          size="custom"
          teamColor={teamColor}
          className="h-6 w-6 rounded-full border border-neutral-300 object-cover object-top shrink-0 bg-white"
        />
        <span className={`truncate text-xs ${played ? "font-semibold text-neutral-900" : "font-normal text-neutral-600"}`}>
          {player.name}
        </span>
      </div>
      {played ? (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 tabular-nums shrink-0"
          title={`Entró al terreno de juego en el minuto ${player.subIn}`}
          aria-label={`Sustitución: entró en el minuto ${player.subIn}`}
        >
          <svg
            className="h-3 w-3 text-emerald-600 shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 14a.75.75 0 01-.75-.75V4.56L4.03 7.78a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 011.06 0L8.75 4.56v8.69A.75.75 0 018 14z"
              clipRule="evenodd"
            />
          </svg>
          <span>{player.subIn}&apos;</span>
        </span>
      ) : (
        <span className="text-[10px] text-neutral-400 shrink-0 select-none" title="No disputó minutos">
          —
        </span>
      )}
    </div>
  );
}
