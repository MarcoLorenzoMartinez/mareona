// Client: Tarjeta interactiva del partido y formulario ágil de pronóstico
'use client';

import React, { useState, useEffect } from 'react';
import { TeamCrest } from '@/components/media/team-crest';
import { PorraScorersPicker } from './porra-scorers-picker';
import { isPorraSubmissionOpen } from '@/lib/porra/engine';
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
  const [isOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isPorraSubmissionOpen(
      match.kickoffAt,
      match.isFinished ? 'finished' : undefined
    );
  });

  const sportingIsHome = match.homeTeam.isSporting;
  const sportingGoals = sportingIsHome ? homeScore : awayScore;

  const handleScoreChange = (isHome: boolean, delta: number) => {
    if (!isOpen) return;
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
    if (!isOpen) return;
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
        <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
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
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-base font-bold text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
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
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-base font-bold text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Añadir gol local"
            >
              +
            </button>
          </div>
        </div>

        <span className="text-sm font-bold text-neutral-400 select-none" aria-hidden="true">VS</span>

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
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-base font-bold text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
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
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-base font-bold text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
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
        disabled={!isOpen}
        className={`flex h-12 min-h-[48px] w-full items-center justify-center rounded-xl px-4 text-xs sm:text-sm font-bold shadow-2xs transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
          !isOpen
            ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
            : 'bg-[#e2001a] text-white hover:bg-[#b30015] active:scale-[0.99]'
        }`}
      >
        {!isOpen
          ? 'Plazo de pronóstico cerrado'
          : isSavedRecently
          ? '✓ Pronóstico guardado'
          : existingPrediction
          ? 'Actualizar pronóstico'
          : 'Confirmar pronóstico'}
      </button>
    </form>
  );
}
