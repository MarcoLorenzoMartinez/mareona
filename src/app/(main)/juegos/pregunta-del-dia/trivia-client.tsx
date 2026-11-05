// Client: Interactive game client for "La pregunta del día" with archive modal and history support
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TriviaDailyChallenge, TriviaPlayerAttempt, TriviaStats } from '@/lib/trivia/types';
import { evaluateTriviaAnswer, getTriviaForDate } from '@/lib/trivia/engine';
import {
  getStoredTriviaAttempt,
  saveTriviaAttempt,
  getStoredTriviaStats,
  updateTriviaStatsOnFinish,
} from '@/lib/trivia/storage';
import { TriviaInputHandler } from './trivia-input-handler';
import { TriviaResultModal } from './trivia-result-modal';
import { TriviaArchiveModal } from './trivia-archive-modal';
import { TriviaArenaBackground } from './trivia-arena-background';
import { TriviaSolvedCard } from './trivia-solved-card';

interface TriviaClientProps {
  challenge: TriviaDailyChallenge;
}

export function TriviaClient({ challenge: initialChallenge }: TriviaClientProps) {
  const [activeDate, setActiveDate] = useState<string>(initialChallenge.dateStr);
  const [challenge, setChallenge] = useState<TriviaDailyChallenge>(initialChallenge);
  const [attempt, setAttempt] = useState<TriviaPlayerAttempt | null>(() =>
    getStoredTriviaAttempt(initialChallenge.dateStr)
  );
  const [stats, setStats] = useState<TriviaStats>(() => getStoredTriviaStats());
  const [inputVal, setInputVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAnswered = attempt !== null;

  const handleSelectDate = (date: string) => {
    setActiveDate(date);
    const nextChallenge = getTriviaForDate(date);
    setChallenge(nextChallenge);
    setAttempt(getStoredTriviaAttempt(date));
    setInputVal('');
    setErrorMsg('');
  };

  function handleSubmit(overrideAnswer?: string) {
    if (isAnswered) return;
    const finalAnswer = (overrideAnswer ?? inputVal).trim();
    if (!finalAnswer) {
      setErrorMsg('Por favor escribe o selecciona una respuesta.');
      return;
    }
    setErrorMsg('');

    const isCorrect = evaluateTriviaAnswer(finalAnswer, challenge.question);
    const newAttempt: TriviaPlayerAttempt = {
      dateStr: challenge.dateStr,
      questionId: challenge.question.id,
      userAnswer: finalAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    saveTriviaAttempt(newAttempt);
    setAttempt(newAttempt);
    const updatedStats = updateTriviaStatsOnFinish(isCorrect, challenge.dateStr);
    setStats(updatedStats);
    setIsModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/juegos"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
            aria-label="Volver a juegos"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            La Pregunta del Día
          </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArchiveOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Abrir archivo de preguntas"
          >
            <span>Archivo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Ver estadísticas del usuario"
          >
            <span>Estadísticas</span>
          </button>
        </div>
      </header>

      {/* Main Question Arena Card with El Molinón Backdrop */}
      <main className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/90 bg-white/90 p-7 sm:p-9 shadow-xs backdrop-blur-xs">
        <TriviaArenaBackground />

        <div>
          <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-neutral-900">
            {challenge.question.question}
          </h2>
        </div>

        {!isAnswered ? (
          <div className="mt-8 flex flex-col gap-4">
            <TriviaInputHandler
              question={challenge.question}
              value={inputVal}
              onChange={setInputVal}
              disabled={isAnswered}
              onSubmit={handleSubmit}
            />

            {errorMsg && (
              <p className="text-xs font-semibold text-[#e2001a]">{errorMsg}</p>
            )}

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#e2001a] px-4 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.99] transition-all select-none"
            >
              Confirmar Respuesta
            </button>
          </div>
        ) : (
          <TriviaSolvedCard
            isCorrect={attempt.isCorrect}
            userAnswer={attempt.userAnswer}
            canonicalAnswer={challenge.question.canonicalAnswer}
            explanation={challenge.question.explanation}
            photoUrl={challenge.question.photoUrl}
            onOpenStats={() => setIsModalOpen(true)}
          />
        )}
      </main>

      {/* Archive Calendar Modal */}
      <TriviaArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        selectedDate={activeDate}
        onSelectDate={handleSelectDate}
        attemptVersion={stats.played}
      />

      {/* Unified Results Modal aligned with Wordle and Mayor o Menor */}
      <TriviaResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={stats}
        challenge={challenge}
        attempt={attempt}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />
    </div>
  );
}
