import React from 'react';
import type { HigherLowerGuess } from '@/lib/higher-lower/types';

interface HigherLowerControlsProps {
  onGuess: (guess: HigherLowerGuess) => void;
  disabled?: boolean;
}

export function HigherLowerControls({
  onGuess,
  disabled = false,
}: HigherLowerControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onGuess('higher')}
        className="group relative flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#e2001a] px-4 text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.96] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Más"
      >
        <span>Más</span>
        <span className="text-xs transition-transform group-hover:-translate-y-0.5">▲</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onGuess('lower')}
        className="group relative flex h-12 items-center justify-center gap-1.5 rounded-full border-2 border-[#e2001a] bg-white px-4 text-sm font-bold text-[#e2001a] shadow-2xs hover:bg-[#e2001a]/5 active:scale-[0.96] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Menos"
      >
        <span>Menos</span>
        <span className="text-xs transition-transform group-hover:translate-y-0.5">▼</span>
      </button>
    </div>
  );
}
