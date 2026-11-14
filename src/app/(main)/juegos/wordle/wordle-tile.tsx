import React from 'react';
import type { LetterEvaluation } from '@/lib/wordle/types';

interface WordleTileProps {
  letter?: string;
  status?: LetterEvaluation;
  isRevealing?: boolean;
  isActiveCursor?: boolean;
  isCurrentRow?: boolean;
  targetLength?: number;
  onClick?: () => void;
}

export function WordleTile({
  letter = '',
  status,
  isRevealing = false,
  isActiveCursor = false,
  isCurrentRow = false,
  targetLength = 5,
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
    bgClasses = 'bg-white border-[#e2001a] ring-2 ring-[#e2001a]/25 text-neutral-900 scale-102 shadow-xs';
  } else if (letter) {
    bgClasses = 'bg-white border-neutral-400 text-neutral-900';
  }

  const isInteractive = isCurrentRow && !status;

  const fontClass =
    targetLength <= 5
      ? 'text-lg sm:text-2xl'
      : targetLength === 6
      ? 'text-base sm:text-xl'
      : targetLength <= 8
      ? 'text-xs min-[380px]:text-sm sm:text-lg'
      : 'text-[11px] sm:text-sm';

  const roundedClass = targetLength <= 6 ? 'rounded-lg' : 'rounded-md sm:rounded-lg';

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      className={`aspect-square w-full max-w-[56px] flex items-center justify-center border-2 font-black uppercase transition-all duration-150 tabular-nums select-none outline-none focus:outline-none touch-manipulation ${fontClass} ${roundedClass} ${bgClasses} ${
        isRevealing ? 'animate-in fade-in zoom-in-95' : ''
      } ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
      aria-label={letter ? `${letter} ${status || ''}` : 'casilla vacía'}
    >
      {letter}
    </button>
  );
}
