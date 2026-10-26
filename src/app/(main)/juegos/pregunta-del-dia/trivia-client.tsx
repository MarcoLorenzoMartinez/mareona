// Client: Interactive game client for "La pregunta del día"
'use client';

import { useState } from 'react';
import type { TriviaDailyChallenge, TriviaPlayerAttempt, TriviaStats } from '@/lib/trivia/types';
import { evaluateTriviaAnswer } from '@/lib/trivia/engine';
import {
  getStoredTriviaAttempt,
  saveTriviaAttempt,
  getStoredTriviaStats,
  updateTriviaStatsOnFinish,
} from '@/lib/trivia/storage';
import { TriviaInputHandler } from './trivia-input-handler';
import { TriviaResultModal } from './trivia-result-modal';
import { TriviaArenaBackground } from './trivia-arena-background';

interface TriviaClientProps {
  challenge: TriviaDailyChallenge;
}

export function TriviaClient({ challenge }: TriviaClientProps) {
  const [attempt, setAttempt] = useState<TriviaPlayerAttempt | null>(() =>
    getStoredTriviaAttempt(challenge.dateStr)
  );
  const [stats, setStats] = useState<TriviaStats>(() => getStoredTriviaStats());
  const [inputVal, setInputVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAnswered = attempt !== null;

  function handleSubmit() {
    if (isAnswered) return;
    if (!inputVal.trim()) {
      setErrorMsg('Por favor escribe o selecciona una respuesta.');
      return;
    }
    setErrorMsg('');

    const isCorrect = evaluateTriviaAnswer(inputVal, challenge.question);
    const newAttempt: TriviaPlayerAttempt = {
      dateStr: challenge.dateStr,
      questionId: challenge.question.id,
      userAnswer: inputVal.trim(),
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
      {/* Top Header Bar similar to Wordle */}
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Trivia Sportinguista
            </span>
            <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
              Día #{challenge.dayIndex}
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-[var(--foreground)]">
            La Pregunta del Día
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          aria-label="Ver estadísticas del usuario"
        >
          <span>Estadísticas</span>
        </button>
      </header>

      {/* Main Question Arena Card with El Molinón Backdrop */}
      <main className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/90 bg-white/90 p-7 sm:p-9 shadow-xs backdrop-blur-xs">
        <TriviaArenaBackground />

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e2001a]">
              Reto #{challenge.dayIndex}
            </span>
            <span className="text-[11px] text-neutral-400">•</span>
            <span className="text-[11px] font-medium text-neutral-500 tabular-nums">
              {challenge.dateStr}
            </span>
          </div>

          <h2 className="mt-3 text-lg sm:text-xl font-bold leading-relaxed text-neutral-900">
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
              onClick={handleSubmit}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#e2001a] px-4 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.99] transition-all select-none"
            >
              Confirmar Respuesta
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            <div
              className={`rounded-2xl p-5 border ${
                attempt.isCorrect
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                  : 'border-red-200 bg-red-50/70 text-red-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm">
                <span>{attempt.isCorrect ? '¡Has acertado!' : 'Has fallado'}</span>
                <span className="text-xs font-semibold opacity-75">
                  {challenge.dateStr}
                </span>
              </div>
              <p className="mt-2 text-xs">
                Tu respuesta: <span className="font-bold">{attempt.userAnswer}</span>
              </p>
              {!attempt.isCorrect && (
                <p className="mt-1 text-xs">
                  Respuesta correcta:{' '}
                  <span className="font-black text-[#e2001a]">
                    {challenge.question.canonicalAnswer}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 text-xs leading-relaxed text-neutral-600 shadow-2xs">
              <span className="font-bold text-neutral-900 block mb-1">
                Contexto Histórico:
              </span>
              {challenge.question.explanation}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98] transition-all"
            >
              Ver mis Estadísticas
            </button>
          </div>
        )}
      </main>

      {/* Unified Results Modal aligned with Wordle and Mayor o Menor */}
      <TriviaResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={stats}
        challenge={challenge}
        attempt={attempt}
      />
    </div>
  );
}
