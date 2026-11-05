// Client: Clean stats and game-over modal aligned with Mareona's design system
'use client';

import React from 'react';
import Link from 'next/link';
import type { TriviaDailyChallenge, TriviaPlayerAttempt, TriviaStats } from '@/lib/trivia/types';

interface TriviaResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TriviaStats;
  challenge: TriviaDailyChallenge;
  attempt: TriviaPlayerAttempt | null;
}

export function TriviaResultModal({
  isOpen,
  onClose,
  stats,
  challenge,
  attempt,
}: TriviaResultModalProps) {
  if (!isOpen) return null;

  const winPercentage = stats.played > 0
    ? Math.round((stats.won / stats.played) * 100)
    : 0;

  const isAnswered = attempt !== null;
  const isCorrect = isAnswered && attempt.isCorrect;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trivia-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs"
    >
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera con badge de estado de alto contraste y limpio */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          {isAnswered ? (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isCorrect
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#e2001a] text-white'
                }`}
              >
                <span>{isCorrect ? '✓' : '✕'}</span>
                <span>{isCorrect ? '¡Acertaste!' : 'Has fallado'}</span>
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Estadísticas
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Revelación destacada de respuesta y explicación histórica */}
        {isAnswered && (
          <div className="mt-4 text-center">
            <span
              className={`text-[11px] font-bold tracking-widest uppercase ${
                isCorrect ? 'text-emerald-700' : 'text-[#e2001a]'
              }`}
            >
              {isCorrect ? 'Respuesta correcta' : 'Solución'}
            </span>
            <h3 id="trivia-modal-title" className="mt-1 text-2xl font-black tracking-tight text-neutral-900">
              {challenge.question.canonicalAnswer}
            </h3>

            <div
              className={`mt-3 rounded-xl border p-3.5 text-left text-xs leading-relaxed ${
                isCorrect
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                  : 'border-neutral-200 bg-[var(--surface)] text-neutral-700'
              }`}
            >
              <span className="block font-bold text-neutral-900 mb-1">
                Contexto histórico:
              </span>
              {challenge.question.explanation}
            </div>
          </div>
        )}

        {/* Resumen métrico 4 columnas idéntico a Wordle */}
        <div className="mt-5 grid grid-cols-4 items-center border-y border-neutral-100 py-3.5 text-center">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Partidas
            </span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">
              {stats.played}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Aciertos
            </span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">
              {winPercentage}%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Racha
            </span>
            <span className="mt-1 text-2xl font-black tabular-nums text-[#e2001a]">
              {stats.currentStreak}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Mejor racha
            </span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">
              {stats.maxStreak}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/juegos"
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all"
          >
            Volver a Juegos
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#e2001a] py-3 text-center text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-98 transition-all"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
