import React from 'react';
import { PlayerPhoto } from '@/components/media/player-photo';
import type { HigherLowerGuess, HigherLowerMode, HigherLowerPlayer } from '@/lib/higher-lower/types';
import { formatMetricValue, getMetricValue } from '@/lib/higher-lower/engine';
import { HigherLowerControls } from './higher-lower-controls';

interface HigherLowerCardProps {
  player: HigherLowerPlayer;
  mode: HigherLowerMode;
  isRevealed: boolean;
  isMystery?: boolean;
  outcome?: 'correct' | 'wrong' | null;
  onGuess?: (guess: HigherLowerGuess) => void;
  disabled?: boolean;
}

export function HigherLowerCard({
  player,
  mode,
  isRevealed,
  isMystery = false,
  outcome = null,
  onGuess,
  disabled = false,
}: HigherLowerCardProps) {
  const metricValue = getMetricValue(player, mode);
  const formattedValue = formatMetricValue(metricValue, mode);

  // Halo y micro-animación según el resultado:
  // - Acierto: Iluminación de confirmación en verde esmeralda.
  // - Fallo: Micro-vibración física elástica de la tarjeta.
  const outcomeCardStyles =
    outcome === 'correct'
      ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-md'
      : outcome === 'wrong'
      ? 'animate-card-shake border-neutral-300 ring-2 ring-neutral-400/30'
      : 'border-neutral-200/90 shadow-xs';

  return (
    <article
      className={`group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-white p-3 sm:p-5 transition-all duration-200 w-full max-w-sm h-full min-h-[250px] sm:min-h-[360px] border ${outcomeCardStyles}`}
    >
      {/* Header del jugador */}
      <div className="flex flex-col items-center text-center w-full">
        {/* Retrato del jugador proporcional (compacto en móvil, amplio en escritorio) */}
        <div className="relative mb-2 sm:mb-3.5 h-16 w-16 sm:h-28 sm:w-28 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform duration-200 group-hover:scale-102">
          <PlayerPhoto
            photoUrl={player.photoUrl}
            playerName={player.name}
            size="lg"
            className="rounded-full h-full w-full object-cover"
          />
        </div>

        {/* Posición integrada */}
        <span className="text-[9px] sm:text-[11px] font-black tracking-widest text-[#e2001a] uppercase">
          {player.position}
        </span>

        {/* Nombre conocido/deportivo del jugador */}
        <h2 className="mt-0.5 sm:mt-1 text-xs sm:text-base font-bold text-neutral-900 min-h-[32px] sm:min-h-[46px] flex items-center justify-center line-clamp-2 px-1 leading-snug">
          {player.name || player.fullName}
        </h2>
      </div>

      {/* Sección del dato estadístico / botones de acción con altura simétrica garantizada */}
      <div className="mt-2 sm:mt-4 w-full border-t border-neutral-100 pt-2 sm:pt-3 text-center">
        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 block truncate mb-1">
          {mode === 'goals' ? 'Goles Oficiales' : mode === 'minutes' ? 'Minutos Disputados' : 'Partidos Oficiales'}
        </span>

        <div className="flex items-center justify-center h-[82px] sm:h-[96px] w-full">
          {isMystery && !isRevealed && onGuess ? (
            <HigherLowerControls
              mysteryPlayerName={player.name || player.fullName}
              mode={mode}
              onGuess={onGuess}
              disabled={disabled}
            />
          ) : isRevealed ? (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
              <span
                className={`text-2xl sm:text-4xl font-black tabular-nums tracking-tight ${
                  outcome === 'correct'
                    ? 'text-emerald-600'
                    : outcome === 'wrong'
                    ? 'text-[#e2001a]'
                    : 'text-[#e2001a]'
                }`}
              >
                {formattedValue}
              </span>
              {outcome === 'correct' && (
                <span className="mt-0.5 text-[10px] sm:text-xs font-black text-emerald-700">
                  ¡Acierto! +1
                </span>
              )}
              {outcome === 'wrong' && (
                <span className="mt-0.5 text-[10px] sm:text-xs font-black text-[#e2001a]">
                  ¡Fin de racha!
                </span>
              )}
            </div>
          ) : (
            <div className="text-2xl sm:text-4xl font-black text-neutral-900 tabular-nums">
              {formattedValue}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
