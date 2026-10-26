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
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onGuess('higher')}
        className="group relative flex h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-5 text-sm sm:text-base font-extrabold text-white shadow-md hover:from-[#c70017] hover:to-[#a80013] hover:shadow-lg active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        aria-label="Más"
      >
        <span className="tracking-wide">Más</span>
        <span className="text-base transition-transform group-hover:-translate-y-0.5">▲</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onGuess('lower')}
        className="group relative flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-5 text-sm sm:text-base font-extrabold text-neutral-800 shadow-xs hover:border-[#e2001a] hover:text-[#e2001a] hover:bg-neutral-50 hover:shadow-md active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        aria-label="Menos"
      >
        <span className="tracking-wide">Menos</span>
        <span className="text-base transition-transform group-hover:translate-y-0.5">▼</span>
      </button>
    </div>
  );
}
