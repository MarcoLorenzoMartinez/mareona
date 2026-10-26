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
}

export function HigherLowerCard({
  player,
  mode,
  isRevealed,
  isMystery = false,
  outcome = null,
}: HigherLowerCardProps) {
  const metricValue = getMetricValue(player, mode);
  const formattedValue = formatMetricValue(metricValue, mode);

  // Halo y micro-animación según el resultado:
  // - Acierto: Iluminación de confirmación en verde esmeralda (border-emerald-500 ring-2 ring-emerald-500/25).
  // - Fallo: Micro-vibración física elástica de la tarjeta.
  const outcomeCardStyles =
    outcome === 'correct'
      ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-md'
      : outcome === 'wrong'
      ? 'animate-card-shake border-neutral-300 ring-2 ring-neutral-400/30'
      : 'border-neutral-200/90 shadow-xs';

  return (
    <article
      className={`group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-white p-6 transition-all duration-200 w-full max-w-sm h-full min-h-[360px] border ${outcomeCardStyles}`}
    >
      {/* Header del jugador */}
      <div className="flex flex-col items-center text-center w-full">
        {/* Retrato del jugador limpio y sobrio sin anillos ni relieves artificiales */}
        <div className="relative mb-3.5 h-28 w-28 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform duration-200 group-hover:scale-102">
          <PlayerPhoto
            photoUrl={player.photoUrl}
            playerName={player.name}
            size="lg"
            className="rounded-full"
          />
        </div>

        {/* Posición integrada: tipografía deportiva limpia */}
        <span className="text-[11px] font-black tracking-widest text-[#e2001a] uppercase">
          {player.position}
        </span>

        {/* Nombre del jugador */}
        <h2 className="mt-1 text-base sm:text-lg font-bold text-neutral-900 min-h-[46px] flex items-center justify-center line-clamp-2 px-2">
          {player.fullName || player.name}
        </h2>
      </div>

      {/* Sección del dato estadístico: siempre en rojo sportinguista */}
      <div className="mt-5 w-full border-t border-neutral-100 pt-3.5 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          {mode === 'goals' ? 'Goles Oficiales' : mode === 'minutes' ? 'Minutos Disputados' : 'Partidos Oficiales'}
        </span>

        <div className="mt-1 flex items-center justify-center min-h-[44px]">
          {isRevealed ? (
            <div className="text-3xl sm:text-4xl font-black text-[#e2001a] tabular-nums tracking-tight animate-in fade-in zoom-in-95 duration-200">
              {formattedValue}
            </div>
          ) : isMystery ? (
            <div className="text-3xl sm:text-4xl font-black text-neutral-400 tabular-nums animate-pulse">
              ¿ ?
            </div>
          ) : (
            <div className="text-3xl sm:text-4xl font-black text-neutral-900 tabular-nums">
              {formattedValue}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
