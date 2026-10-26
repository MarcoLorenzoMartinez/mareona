import React from 'react';
import { PlayerPhoto } from '@/components/media/player-photo';
import type { HigherLowerMode, HigherLowerPlayer } from '@/lib/higher-lower/types';
import { formatMetricValue, getMetricValue } from '@/lib/higher-lower/engine';

interface HigherLowerCardProps {
  player: HigherLowerPlayer;
  mode: HigherLowerMode;
  isRevealed: boolean;
  isMystery?: boolean;
  outcome?: 'correct' | 'wrong' | null;
  controlsSlot?: React.ReactNode;
}

export function HigherLowerCard({
  player,
  mode,
  isRevealed,
  isMystery = false,
  outcome = null,
  controlsSlot,
}: HigherLowerCardProps) {
  const metricValue = getMetricValue(player, mode);
  const formattedValue = formatMetricValue(metricValue, mode);

  // Border styling based on reveal result
  const outcomeCardBorder =
    outcome === 'correct'
      ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-md'
      : outcome === 'wrong'
      ? 'border-rose-400 ring-2 ring-rose-400/20 shadow-md'
      : 'border-[var(--border)] shadow-2xs';

  return (
    <article
      className={`relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 w-full max-w-sm h-full min-h-[440px] border ${outcomeCardBorder}`}
    >
      <div className="flex flex-col items-center text-center w-full">
        <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--surface)] shadow-inner flex items-center justify-center transition-transform hover:scale-105">
          <PlayerPhoto
            photoUrl={player.photoUrl}
            playerName={player.name}
            size="lg"
            className="rounded-full"
          />
        </div>

        <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-0.5 text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
          {player.position}
        </span>

        <h2 className="mt-2.5 text-base sm:text-lg font-bold text-[var(--foreground)] min-h-[48px] flex items-center justify-center line-clamp-2 px-1">
          {player.fullName || player.name}
        </h2>
      </div>

      <div className="mt-4 w-full flex flex-col justify-end">
        <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            {mode === 'goals' ? 'Goles Oficiales' : mode === 'minutes' ? 'Minutos Disputados' : 'Partidos Oficiales'}
          </span>

          <div className="mt-1 flex items-center justify-center min-h-[36px]">
            {isRevealed ? (
              <div
                className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight animate-in fade-in zoom-in-95 duration-200 ${
                  outcome === 'correct'
                    ? 'text-emerald-600'
                    : outcome === 'wrong'
                    ? 'text-rose-600'
                    : 'text-[#e2001a]'
                }`}
              >
                {formattedValue}
              </div>
            ) : isMystery ? (
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground-muted)] tabular-nums animate-pulse">
                ¿ ?
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tabular-nums">
                {formattedValue}
              </div>
            )}
          </div>
        </div>

        {/* Slot para controles integrados en la tarjeta misteriosa */}
        {controlsSlot ? (
          <div className="mt-4 w-full flex flex-col items-center min-h-[82px] justify-center">
            {controlsSlot}
          </div>
        ) : (
          <div className="mt-4 hidden md:block min-h-[82px]" aria-hidden="true" />
        )}
      </div>
    </article>
  );
}
