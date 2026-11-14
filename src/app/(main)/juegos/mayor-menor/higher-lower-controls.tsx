import React from 'react';
import type { HigherLowerGuess, HigherLowerMode } from '@/lib/higher-lower/types';

interface HigherLowerControlsProps {
  referenceValue: string;
  mysteryPlayerName: string;
  mode: HigherLowerMode;
  outcome?: 'correct' | 'wrong' | null;
  onGuess: (guess: HigherLowerGuess) => void;
  disabled?: boolean;
}

export function HigherLowerControls({
  referenceValue,
  mysteryPlayerName,
  mode,
  outcome = null,
  onGuess,
  disabled = false,
}: HigherLowerControlsProps) {
  const metricName =
    mode === 'goals'
      ? 'goles'
      : mode === 'minutes'
      ? 'minutos'
      : 'partidos';

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-8 items-stretch justify-items-center w-full max-w-3xl mx-auto mt-2.5 sm:mt-4 z-10">
      {/* Columna Izquierda: Tarjeta contextual alineada debajo del jugador de referencia */}
      <div className="w-full flex flex-col justify-center">
        <div
          className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border text-center transition-all min-h-[96px] sm:min-h-[52px] ${
            outcome === 'correct'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : outcome === 'wrong'
              ? 'border-red-300 bg-red-50 text-[var(--primary)]'
              : 'border-neutral-200/90 bg-white/95 text-neutral-600 shadow-2xs'
          }`}
        >
          {outcome === 'correct' ? (
            <span className="text-xs sm:text-sm font-black text-emerald-700 animate-in fade-in">
              ¡Acierto! +1
            </span>
          ) : outcome === 'wrong' ? (
            <span className="text-xs sm:text-sm font-black text-[var(--primary)] animate-in fade-in">
              ¡Fin de la racha!
            </span>
          ) : (
            <>
              <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 leading-tight">
                ¿Tendrá más o menos que
              </span>
              <span className="mt-0.5 text-xs sm:text-sm font-black text-neutral-900 tabular-nums">
                {referenceValue}?
              </span>
            </>
          )}
        </div>
      </div>

      {/* Columna Derecha: Los dos botones Más y Menos agrupados debajo de la tarjeta a adivinar */}
      <div className="w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onGuess('higher')}
            className="group relative flex h-11 sm:h-12 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-3 sm:px-4 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:from-[#c70017] hover:to-[#a80013] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
            aria-label={`Votar que ${mysteryPlayerName} tiene más ${metricName}`}
          >
            <span className="tracking-wide">Más</span>
            <span className="text-sm transition-transform group-hover:-translate-y-0.5" aria-hidden="true">
              ▲
            </span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onGuess('lower')}
            className="group relative flex h-11 sm:h-12 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border-2 border-neutral-300 bg-white px-3 sm:px-4 text-xs sm:text-sm font-extrabold text-neutral-800 shadow-xs hover:border-[#e2001a] hover:text-[#e2001a] hover:bg-neutral-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
            aria-label={`Votar que ${mysteryPlayerName} tiene menos ${metricName}`}
          >
            <span className="tracking-wide">Menos</span>
            <span className="text-sm transition-transform group-hover:translate-y-0.5" aria-hidden="true">
              ▼
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
