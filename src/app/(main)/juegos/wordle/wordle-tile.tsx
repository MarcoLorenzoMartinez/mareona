import React from 'react';
import type { LetterEvaluation } from '@/lib/wordle/types';

interface WordleTileProps {
  letter?: string;
  status?: LetterEvaluation;
  isRevealing?: boolean;
  isActiveCursor?: boolean;
  isCurrentRow?: boolean;
  onClick?: () => void;
}

export function WordleTile({
  letter = '',
  status,
  isRevealing = false,
  isActiveCursor = false,
  isCurrentRow = false,
  onClick,
}: WordleTileProps) {
  let bgClasses = 'bg-white border-neutral-200 text-neutral-900';

  if (status === 'correct') {
    bgClasses = 'bg-emerald-600 border-emerald-600 text-white';
  } else if (status === 'present') {
    bgClasses = 'bg-amber-500 border-amber-500 text-white';
  } else if (status === 'absent') {
    bgClasses = 'bg-[var(--surface-raised,var(--surface))] border-neutral-200 text-neutral-400';
  } else if (isActiveCursor) {
    bgClasses = 'bg-white border-[#e2001a] ring-2 ring-[#e2001a]/25 text-neutral-900 scale-105 shadow-xs';
  } else if (letter) {
    bgClasses = 'bg-white border-neutral-400 text-neutral-900';
  }

  const isInteractive = isCurrentRow && !status;

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 font-bold text-base sm:text-lg md:text-xl uppercase transition-all duration-150 tabular-nums select-none outline-none focus:outline-none ${bgClasses} ${
        isRevealing ? 'animate-in fade-in zoom-in-95' : ''
      } ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
      aria-label={letter ? `${letter} ${status || ''}` : 'casilla vacía'}
    >
      {letter}
    </button>
  );
}
