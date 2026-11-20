import React from 'react';
import type { HigherLowerMode } from '@/lib/higher-lower/types';
import { getDictionary } from '@/i18n';

interface HigherLowerModeSelectorProps {
  currentMode: HigherLowerMode;
  onSelectMode: (mode: HigherLowerMode) => void;
  disabled?: boolean;
}

export function HigherLowerModeSelector({
  currentMode,
  onSelectMode,
  disabled = false,
}: HigherLowerModeSelectorProps) {
  const dict = getDictionary();
  const modes: { id: HigherLowerMode; label: string }[] = [
    { id: 'matches', label: dict.games.higherLower.modeSelector.matches },
    { id: 'goals', label: dict.games.higherLower.modeSelector.goals },
    { id: 'minutes', label: dict.games.higherLower.modeSelector.minutes },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={dict.games.higherLower.modeSelector.aria}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
    >
      {modes.map((mode) => {
        const isSelected = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelectMode(mode.id)}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
              isSelected
                ? 'bg-[#e2001a] text-white shadow-2xs'
                : 'text-[var(--foreground)] hover:bg-white/60 active:scale-95'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
