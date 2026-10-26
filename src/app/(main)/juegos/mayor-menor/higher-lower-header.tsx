import React from 'react';
import type { HigherLowerMode } from '@/lib/higher-lower/types';
import { HigherLowerModeSelector } from './higher-lower-mode-selector';

interface HigherLowerHeaderProps {
  mode: HigherLowerMode;
  onSelectMode: (mode: HigherLowerMode) => void;
  isRevealed: boolean;
  currentScore: number;
  bestScore: number;
}

export function HigherLowerHeader({
  mode,
  onSelectMode,
  isRevealed,
  currentScore,
  bestScore,
}: HigherLowerHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-200 pb-4">
      <div>
        <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          Pasatiempo
        </span>
        <h1 className="mt-1.5 text-xl font-bold text-neutral-900">
          ¿Mayor o Menor?
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <HigherLowerModeSelector
          currentMode={mode}
          onSelectMode={onSelectMode}
          disabled={isRevealed}
        />

        {/* Indicador de Racha sobrio y deportivo: sin emojis ni fondos amarillos chillones */}
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Racha
            </span>
            <span className="text-sm font-black tabular-nums text-[#e2001a]">
              {currentScore}
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-neutral-200" aria-hidden="true" />

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Récord
            </span>
            <span className="text-sm font-black tabular-nums text-neutral-800">
              {bestScore}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
