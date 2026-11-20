import React from 'react';
import type { HigherLowerGuess, HigherLowerMode } from '@/lib/higher-lower/types';
import { getDictionary } from '@/i18n';

interface HigherLowerControlsProps {
  mysteryPlayerName: string;
  mode: HigherLowerMode;
  onGuess: (guess: HigherLowerGuess) => void;
  disabled?: boolean;
}

export function HigherLowerControls({
  mysteryPlayerName,
  mode,
  onGuess,
  disabled = false,
}: HigherLowerControlsProps) {
  const dict = getDictionary();
  const metricName =
    mode === 'goals'
      ? dict.games.higherLower.controls.metricNames.goals
      : mode === 'minutes'
      ? dict.games.higherLower.controls.metricNames.minutes
      : dict.games.higherLower.controls.metricNames.matches;

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 w-full justify-center">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onGuess('higher')}
        className="group relative flex h-9 sm:h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-2 sm:px-4 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:from-[#c70017] hover:to-[#a80013] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
        aria-label={`${dict.games.higherLower.controls.voteHigherPrefix} ${mysteryPlayerName} ${dict.games.higherLower.controls.voteHigherMid} ${metricName}`}
      >
        <span className="tracking-wide">{dict.games.higherLower.controls.higherButton}</span>
        <span className="text-xs sm:text-sm transition-transform group-hover:-translate-y-0.5" aria-hidden="true">
          ▲
        </span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onGuess('lower')}
        className="group relative flex h-9 sm:h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-2 sm:px-4 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:from-[#c70017] hover:to-[#a80013] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
        aria-label={`${dict.games.higherLower.controls.voteLowerPrefix} ${mysteryPlayerName} ${dict.games.higherLower.controls.voteLowerMid} ${metricName}`}
      >
        <span className="tracking-wide">{dict.games.higherLower.controls.lowerButton}</span>
        <span className="text-xs sm:text-sm transition-transform group-hover:translate-y-0.5" aria-hidden="true">
          ▼
        </span>
      </button>
    </div>
  );
}
