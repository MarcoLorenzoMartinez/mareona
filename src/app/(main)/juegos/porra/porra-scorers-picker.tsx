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
            <div className="relative flex-1">
              <select
                value={selectedScorers[i] || ''}
                disabled={disabled}
                onChange={(e) => handleSelectScorer(i, e.target.value)}
                aria-label={`Goleador ${i + 1}`}
                className="w-full min-h-[44px] appearance-none rounded-xl border border-[var(--border)] bg-white pl-3.5 pr-10 py-2 text-xs font-semibold text-neutral-900 focus:border-[#e2001a] focus:ring-2 focus:ring-[#e2001a]/20 focus:outline-none disabled:opacity-100 disabled:bg-white disabled:text-neutral-800 disabled:[-webkit-text-fill-color:#262626] disabled:cursor-default transition-colors"
              >
                <option value="">Selecciona un goleador...</option>
                {availablePlayers.map((player) => (
                  <option key={player} value={player}>
                    {player}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  disabled ? 'text-neutral-300' : 'text-neutral-500'
                }`}
              >
                <path
                  d="M5.5 7.5L10 12l4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
