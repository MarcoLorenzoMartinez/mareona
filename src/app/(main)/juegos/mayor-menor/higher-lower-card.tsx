import React from 'react';
import { PlayerPhoto } from '@/components/media/player-photo';
import type { HigherLowerMode, HigherLowerPlayer } from '@/lib/higher-lower/types';
import { formatMetricValue, getMetricValue } from '@/lib/higher-lower/engine';

interface HigherLowerCardProps {
  player: HigherLowerPlayer;
  mode: HigherLowerMode;
  isRevealed: boolean;
  isMystery?: boolean;
}

export function HigherLowerCard({
  player,
  mode,
  isRevealed,
  isMystery = false,
}: HigherLowerCardProps) {
  const metricValue = getMetricValue(player, mode);
  const formattedValue = formatMetricValue(metricValue, mode);

  return (
    <article
      className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs transition-all w-full max-w-sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3 h-24 w-24 overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--surface)] shadow-inner flex items-center justify-center">
          <PlayerPhoto
            photoUrl={player.photoUrl}
            playerName={player.name}
            size="lg"
            className="rounded-full"
          />
        </div>

        <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
          {player.position}
        </span>

        <h2 className="mt-2 text-lg font-bold text-[var(--foreground)]">
          {player.fullName || player.name}
        </h2>

        <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
          {player.startSeason} – {player.endSeason}
        </p>
      </div>

      <div className="mt-5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          {mode === 'goals' ? 'Goles Oficiales' : mode === 'minutes' ? 'Minutos Disputados' : 'Partidos Oficiales'}
        </span>

        <div className="mt-1">
          {isRevealed ? (
            <div className="text-2xl font-extrabold text-[#e2001a] tabular-nums animate-in fade-in zoom-in-95">
              {formattedValue}
            </div>
          ) : isMystery ? (
            <div className="text-2xl font-extrabold text-[var(--foreground-muted)] tabular-nums">
              ¿ ?
            </div>
          ) : (
            <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">
              {formattedValue}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
