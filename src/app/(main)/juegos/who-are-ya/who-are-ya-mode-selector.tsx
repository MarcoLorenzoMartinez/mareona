import React from 'react';
import type { WhoAreYaGameMode } from '@/lib/who-are-ya/types';

interface WhoAreYaModeSelectorProps {
  currentMode: WhoAreYaGameMode;
  onSelectMode: (mode: WhoAreYaGameMode) => void;
  disabled?: boolean;
}

const MODES: { id: WhoAreYaGameMode; label: string }[] = [
  { id: 'players', label: 'Jugadores' },
  { id: 'kits', label: 'Camisetas' },
];

export function WhoAreYaModeSelector({
  currentMode,
  onSelectMode,
  disabled = false,
}: WhoAreYaModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de juego Who Are Ya"
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
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
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
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
