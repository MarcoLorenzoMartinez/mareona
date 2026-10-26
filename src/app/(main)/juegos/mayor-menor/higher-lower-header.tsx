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
  const isHotStreak = currentScore >= 3;

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
      <div>
        <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          Pasatiempo
        </span>
        <h1 className="mt-1.5 text-xl font-bold text-[var(--foreground)]">
          ¿Mayor o Menor?
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <HigherLowerModeSelector
          currentMode={mode}
          onSelectMode={onSelectMode}
          disabled={isRevealed}
        />

        <div
          className={`flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold transition-all duration-300 ${
            isHotStreak
              ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
              : 'border-[var(--border)] bg-white text-[var(--foreground)]'
          }`}
        >
          <span className="flex items-center gap-1">
            {isHotStreak && <span className="animate-bounce">🔥</span>}
            Racha: <strong className="text-[#e2001a] font-bold tabular-nums">{currentScore}</strong>
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="text-[var(--foreground-muted)] text-[11px]">
            Récord: <strong className="tabular-nums text-[var(--foreground)]">{bestScore}</strong>
          </span>
        </div>
      </div>
    </header>
  );
}
