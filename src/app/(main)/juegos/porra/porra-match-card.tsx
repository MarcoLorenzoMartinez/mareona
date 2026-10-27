// Client: Tarjeta interactiva del partido y formulario ágil de pronóstico
'use client';

import React, { useState } from 'react';
import { TeamCrest } from '@/components/media/team-crest';
import { PorraScorersPicker } from './porra-scorers-picker';
import type { PorraMatch, PorraPrediction } from '@/lib/porra/types';

interface PorraMatchCardProps {
  match: PorraMatch;
  existingPrediction: PorraPrediction | null;
  onSavePrediction: (pred: PorraPrediction) => void;
  availablePlayers: string[];
}

export function PorraMatchCard({
  match,
  existingPrediction,
  onSavePrediction,
  availablePlayers,
}: PorraMatchCardProps) {
  const [homeScore, setHomeScore] = useState<number>(() => existingPrediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(() => existingPrediction?.awayScore ?? 0);
  const [scorers, setScorers] = useState<string[]>(() => existingPrediction?.sportingScorers ?? []);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const sportingIsHome = match.homeTeam.isSporting;
  const sportingGoals = sportingIsHome ? homeScore : awayScore;

  const handleScoreChange = (isHome: boolean, delta: number) => {
    if (isHome) {
      const next = Math.max(0, Math.min(9, homeScore + delta));
      setHomeScore(next);
      if (sportingIsHome && next < scorers.length) {
        setScorers((prev) => prev.slice(0, next));
      }
    } else {
      const next = Math.max(0, Math.min(9, awayScore + delta));
      setAwayScore(next);
      if (!sportingIsHome && next < scorers.length) {
        setScorers((prev) => prev.slice(0, next));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prediction: PorraPrediction = {
      matchId: match.id,
      homeScore,
      awayScore,
      sportingScorers: scorers.filter(Boolean),
      submittedAt: new Date().toISOString(),
    };
    onSavePrediction(prediction);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          {match.roundName}
        </span>
      </div>

      {/* Marcador Táctil */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
        {/* Local */}
        <div className="flex flex-col items-center gap-2">
          <TeamCrest
            crestUrl={match.homeTeam.crestUrl}
            teamName={match.homeTeam.name}
            isSporting={match.homeTeam.isSporting}
            size="md"
          />
          <span className="text-center text-xs font-bold text-neutral-900 line-clamp-1">
            {match.homeTeam.name}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScoreChange(true, -1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
              aria-label="Restar gol local"
            >
              -
            </button>
            <span className="w-8 text-center text-2xl font-black tabular-nums text-neutral-900">
              {homeScore}
            </span>
            <button
              type="button"
              onClick={() => handleScoreChange(true, 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
              aria-label="Añadir gol local"
            >
              +
            </button>
          </div>
        </div>

        <span className="text-sm font-bold text-neutral-300">VS</span>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-2">
          <TeamCrest
            crestUrl={match.awayTeam.crestUrl}
            teamName={match.awayTeam.name}
            isSporting={match.awayTeam.isSporting}
            size="md"
          />
          <span className="text-center text-xs font-bold text-neutral-900 line-clamp-1">
            {match.awayTeam.name}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScoreChange(false, -1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
              aria-label="Restar gol visitante"
            >
              -
            </button>
            <span className="w-8 text-center text-2xl font-black tabular-nums text-neutral-900">
              {awayScore}
            </span>
            <button
              type="button"
              onClick={() => handleScoreChange(false, 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
              aria-label="Añadir gol visitante"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Selector dinámico de goleadores del Sporting */}
      <PorraScorersPicker
        sportingGoals={sportingGoals}
        selectedScorers={scorers}
        onChangeScorers={setScorers}
        availablePlayers={availablePlayers}
      />

      {/* Acción de Guardado */}
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#e2001a] px-4 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.99] transition-all select-none"
      >
        {isSavedRecently ? '✓ Pronóstico guardado' : existingPrediction ? 'Actualizar pronóstico' : 'Confirmar pronóstico'}
      </button>
    </form>
  );
}
