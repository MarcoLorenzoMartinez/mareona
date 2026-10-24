import React from 'react';
import type { LetterEvaluation } from '@/lib/wordle/types';

interface WordleTileProps {
  letter?: string;
  status?: LetterEvaluation;
  isRevealing?: boolean;
}

export function WordleTile({ letter = '', status, isRevealing = false }: WordleTileProps) {
  let bgClasses = 'bg-white border-[var(--border)] text-[var(--foreground)]';

  if (status === 'correct') {
    // Red Sporting brand color for correct match (primary)
    bgClasses = 'bg-[#e2001a] border-[#e2001a] text-white';
  } else if (status === 'present') {
    // Warm amber for present
    bgClasses = 'bg-amber-500 border-amber-500 text-white';
  } else if (status === 'absent') {
    // Muted gray for absent
    bgClasses = 'bg-[var(--surface-raised,var(--surface))] border-[var(--border)] text-[var(--foreground-muted)]';
  } else if (letter) {
    // Active typing cell
    bgClasses = 'bg-white border-zinc-400 text-[var(--foreground)] scale-[1.02]';
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 font-bold text-lg sm:text-xl md:text-2xl uppercase transition-transform duration-150 tabular-nums select-none aspect-square ${bgClasses} ${
        isRevealing ? 'animate-in fade-in zoom-in-95' : ''
      }`}
      aria-label={letter ? `${letter} ${status || ''}` : 'casilla vacía'}
    >
      {letter}
    </div>
  );
}
