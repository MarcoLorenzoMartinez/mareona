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
      className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border shadow-2xs hover:shadow-xs transition-all text-center w-[72px] sm:w-[78px] h-[76px] sm:h-[82px] shrink-0"
      style={{ backgroundColor: `${teamColor}0a`, borderColor: `${teamColor}22` }}
    >
      <PlayerPhoto
        photoUrl={player.photoUrl}
        playerName={player.name}
        size="md"
        teamColor={teamColor}
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border border-neutral-200/80 object-cover object-top shrink-0 bg-white shadow-2xs"
      />
      <span className="font-bold text-[10px] sm:text-[11px] text-[var(--foreground)] truncate max-w-full text-center mt-1 px-0.5">
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
        size="sm"
        teamColor={teamColor}
        className="h-5 w-5 rounded-full border border-neutral-200/80 object-cover object-top shrink-0 bg-white"
      />
      <span className="truncate">{player.name}</span>
    </div>
  );
}
