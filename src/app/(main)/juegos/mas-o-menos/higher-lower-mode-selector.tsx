import React from 'react';
import type { HigherLowerMode } from '@/lib/higher-lower/types';

interface HigherLowerModeSelectorProps {
  currentMode: HigherLowerMode;
  onSelectMode: (mode: HigherLowerMode) => void;
  disabled?: boolean;
}

const MODES: { id: HigherLowerMode; label: string }[] = [
  { id: 'matches', label: 'Partidos' },
  { id: 'goals', label: 'Goles' },
  { id: 'minutes', label: 'Minutos' },
];

export function HigherLowerModeSelector({
  currentMode,
  onSelectMode,
  disabled = false,
}: HigherLowerModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de juego"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
    >
      {MODES.map((mode) => {
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
