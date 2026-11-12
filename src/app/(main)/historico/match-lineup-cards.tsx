// Client: Componentes atómicos para tarjetas de titulares y fichas de banquillo
"use client";

import type { HistoricalMatchPlayer } from "@/lib/historical/types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface StarterCardProps {
  readonly player: HistoricalMatchPlayer;
  readonly teamColor: string;
}

/**
 * Compact vertical player card displaying bust photo or avatar fallback, and alias.
 * Uniform fixed size across all positions without individual repetitive badges.
 */
export function StarterCard({ player, teamColor }: StarterCardProps) {
  return (
    <div
      className="group flex flex-col items-center justify-start text-center w-[72px] sm:w-[80px] py-1 px-0.5 rounded-xl transition-all shrink-0 hover:bg-neutral-100/60 cursor-default"
    >
      <div
        className="relative flex items-center justify-center rounded-full p-0.5 border-2 shadow-xs group-hover:scale-105 transition-transform bg-white shrink-0"
        style={{ borderColor: teamColor }}
      >
        <PlayerPhoto
          photoUrl={player.photoUrl}
          playerName={player.name}
          size="custom"
          teamColor={teamColor}
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover object-top shrink-0"
        />
      </div>
      <span
        className="font-bold text-[11px] sm:text-xs text-[var(--foreground)] truncate max-w-full text-center mt-1.5 px-0.5 leading-tight block"
        title={player.name}
      >
        {player.name}
      </span>
    </div>
  );
}

interface BenchChipProps {
  readonly player: HistoricalMatchPlayer;
  readonly teamColor: string;
}

/**
 * Pill chip for substitute bench players with micro-photo and alias.
 */
export function BenchChip({ player, teamColor }: BenchChipProps) {
  const played = player.subIn !== undefined;
  return (
    <div
      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs transition-colors ${
        played
          ? "font-semibold text-[var(--foreground)] shadow-2xs hover:bg-[var(--surface)]"
          : "font-medium text-[var(--foreground-muted)] hover:bg-white"
      }`}
      style={{
        backgroundColor: played ? `${teamColor}12` : `${teamColor}06`,
        borderColor: played ? `${teamColor}33` : `${teamColor}1a`,
        borderWidth: "1px",
      }}
      title={played ? `Jugó (entró en el minuto ${player.subIn})` : "Suplente sin minutos"}
    >
      <PlayerPhoto
        photoUrl={player.photoUrl}
        playerName={player.name}
        size="custom"
        teamColor={teamColor}
        className="h-5 w-5 rounded-full border border-neutral-200/80 object-cover object-top shrink-0 bg-white"
      />
      <span className="truncate">{player.name}</span>
    </div>
  );
}
