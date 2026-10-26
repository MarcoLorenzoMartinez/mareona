import React from 'react';
import type { HigherLowerGuess } from '@/lib/higher-lower/types';

interface HigherLowerControlsProps {
  onGuess: (guess: HigherLowerGuess) => void;
  disabled?: boolean;
  comparedPlayerName: string;
}

export function HigherLowerControls({
  onGuess,
  disabled = false,
  comparedPlayerName,
}: HigherLowerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 w-full mx-auto">
      <span className="text-[11px] font-semibold text-[var(--foreground-muted)] text-center line-clamp-1">
        ¿Tiene más o menos que <strong className="text-[var(--foreground)]">{comparedPlayerName}</strong>?
      </span>

      <div className="grid grid-cols-2 gap-2.5 w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onGuess('higher')}
          className="group relative flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#e2001a] px-3 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.96] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Más"
        >
          <span>Más</span>
          <span className="text-[11px] transition-transform group-hover:-translate-y-0.5">▲</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onGuess('lower')}
          className="group relative flex h-11 items-center justify-center gap-1.5 rounded-full border-2 border-[#e2001a] bg-white px-3 text-xs sm:text-sm font-bold text-[#e2001a] shadow-2xs hover:bg-[#e2001a]/5 active:scale-[0.96] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Menos"
        >
          <span>Menos</span>
          <span className="text-[11px] transition-transform group-hover:translate-y-0.5">▼</span>
        </button>
      </div>
    </div>
  );
}
