import React from 'react';
import Link from 'next/link';
import type { HigherLowerMode } from '@/lib/higher-lower/types';
import { HigherLowerModeSelector } from './higher-lower-mode-selector';
import { getDictionary } from '@/i18n';

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
  const dict = getDictionary();
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-200 pb-4">
      <div className="flex items-center gap-3">
        <Link
          href="/juegos"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
          aria-label={dict.games.higherLower.header.backAria}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {dict.games.higherLower.header.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <HigherLowerModeSelector
          currentMode={mode}
          onSelectMode={onSelectMode}
          disabled={isRevealed}
        />

        {/* Indicador de Racha sobrio y deportivo */}
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {dict.games.higherLower.header.streakLabel}
            </span>
            <span className="text-sm font-black tabular-nums text-[#e2001a]">
              {currentScore}
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-neutral-200" aria-hidden="true" />

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {dict.games.higherLower.header.bestLabel}
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
