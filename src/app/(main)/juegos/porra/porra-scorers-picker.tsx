// Client: Selector dinámico de goleadores según los goles del Sporting pronosticados
'use client';

import React from 'react';

interface PorraScorersPickerProps {
  sportingGoals: number;
  selectedScorers: string[];
  onChangeScorers: (scorers: string[]) => void;
  availablePlayers: string[];
  disabled?: boolean;
}

export function PorraScorersPicker({
  sportingGoals,
  selectedScorers,
  onChangeScorers,
  availablePlayers,
  disabled = false,
}: PorraScorersPickerProps) {
  if (sportingGoals <= 0) return null;

  const handleSelectScorer = (slotIndex: number, playerName: string) => {
    const updated = [...selectedScorers];
    updated[slotIndex] = playerName;
    onChangeScorers(updated.slice(0, sportingGoals));
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--foreground)]">
          Goleadores del Real Sporting
        </span>
        <span className="text-[11px] font-semibold text-[#e2001a] tabular-nums">
          +1 pto por acierto
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: sportingGoals }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-neutral-500 shadow-2xs border border-[var(--border)] tabular-nums shrink-0">
              {i + 1}
            </span>
            <select
              value={selectedScorers[i] || ''}
              disabled={disabled}
              onChange={(e) => handleSelectScorer(i, e.target.value)}
              aria-label={`Goleador ${i + 1}`}
              className="flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] focus:border-[#e2001a] focus:outline-none transition-colors"
            >
              <option value="">Selecciona un goleador...</option>
              {availablePlayers.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
