// Client: Tarjeta interactiva del partido y formulario de pronóstico definitivo
'use client';

import React, { useState } from 'react';
import { PorraScoreCounter } from './porra-score-counter';
import { PorraScorersPicker } from './porra-scorers-picker';
import { isPorraSubmissionOpen } from '@/lib/porra/engine';
import type { PorraMatch, PorraPrediction } from '@/lib/porra/types';

interface PorraMatchCardProps {
  readonly match: PorraMatch;
  readonly existingPrediction: PorraPrediction | null;
  readonly onSavePrediction: (pred: PorraPrediction) => void;
  readonly availablePlayers: string[];
  readonly isAuthenticated?: boolean;
  readonly onRequireAuth?: () => void;
}

export function PorraMatchCard({
  match,
  existingPrediction,
  onSavePrediction,
  availablePlayers,
  isAuthenticated = false,
  onRequireAuth,
}: PorraMatchCardProps) {
  const [homeScore, setHomeScore] = useState<number>(() => existingPrediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(() => existingPrediction?.awayScore ?? 0);
  const [scorers, setScorers] = useState<string[]>(() => existingPrediction?.sportingScorers ?? []);
  const [isOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isPorraSubmissionOpen(
      match.kickoffAt,
      match.isFinished ? 'finished' : undefined
    );
  });

  const isSubmitted = existingPrediction !== null;
  const isLocked = !isOpen || isSubmitted;
  const displayedHome = existingPrediction ? existingPrediction.homeScore : homeScore;
  const displayedAway = existingPrediction ? existingPrediction.awayScore : awayScore;
  const displayedScorers = existingPrediction ? existingPrediction.sportingScorers : scorers;

  const sportingIsHome = match.homeTeam.isSporting;
  const sportingGoals = sportingIsHome ? displayedHome : displayedAway;

  const handleScoreChange = (isHome: boolean, delta: number) => {
    if (isLocked) return;
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
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    if (isLocked) return;
    onSavePrediction({
      matchId: match.id,
      homeScore,
      awayScore,
      sportingScorers: scorers.filter(Boolean),
      submittedAt: new Date().toISOString(),
    });
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

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
        <PorraScoreCounter
          teamName={match.homeTeam.name}
          crestUrl={match.homeTeam.crestUrl}
          isSporting={match.homeTeam.isSporting}
          score={displayedHome}
          isLocked={isLocked}
          onScoreChange={(delta) => handleScoreChange(true, delta)}
          minusLabel="Restar gol local"
          plusLabel="Añadir gol local"
        />

        <span className="text-sm font-bold text-neutral-400 select-none" aria-hidden="true">
          VS
        </span>

        <PorraScoreCounter
          teamName={match.awayTeam.name}
          crestUrl={match.awayTeam.crestUrl}
          isSporting={match.awayTeam.isSporting}
          score={displayedAway}
          isLocked={isLocked}
          onScoreChange={(delta) => handleScoreChange(false, delta)}
          minusLabel="Restar gol visitante"
          plusLabel="Añadir gol visitante"
        />
      </div>

      <PorraScorersPicker
        sportingGoals={sportingGoals}
        selectedScorers={displayedScorers}
        onChangeScorers={setScorers}
        availablePlayers={availablePlayers}
        disabled={isLocked}
      />

      <button
        type="submit"
        disabled={isAuthenticated && isLocked}
        className={`flex h-12 min-h-[48px] w-full items-center justify-center rounded-xl px-4 text-xs sm:text-sm font-bold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
          !isAuthenticated
            ? 'bg-[#e2001a] text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.99] cursor-pointer'
            : isSubmitted
            ? 'border border-[var(--border)] bg-[var(--surface)] text-neutral-700 cursor-default'
            : !isOpen
            ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
            : 'bg-[#e2001a] text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.99] cursor-pointer'
        }`}
      >
        {!isAuthenticated
          ? 'Iniciar sesión para pronosticar'
          : isSubmitted
          ? 'Pronóstico registrado'
          : !isOpen
          ? 'Plazo de pronóstico cerrado'
          : 'Confirmar pronóstico'}
      </button>
    </form>
  );
}
