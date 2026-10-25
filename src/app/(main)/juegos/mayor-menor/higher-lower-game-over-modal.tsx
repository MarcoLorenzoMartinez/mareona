import React from 'react';
import type { HigherLowerMode } from '@/lib/higher-lower/types';

interface HigherLowerGameOverModalProps {
  isOpen: boolean;
  score: number;
  bestScore: number;
  mode: HigherLowerMode;
  onPlayAgain: () => void;
}

export function HigherLowerGameOverModal({
  isOpen,
  score,
  bestScore,
  mode,
  onPlayAgain,
}: HigherLowerGameOverModalProps) {
  if (!isOpen) return null;

  const modeName = mode === 'goals' ? 'Goles' : mode === 'minutes' ? 'Minutos' : 'Partidos';
  const isNewRecord = score > 0 && score >= bestScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs"
    >
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-xl animate-in fade-in zoom-in-95">
        <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700 uppercase tracking-wider">
          Fin de partida
        </span>

        <h2 id="gameover-title" className="mt-3 text-xl font-extrabold text-[var(--foreground)]">
          {isNewRecord ? '¡Nuevo Récord!' : '¡Buen intento!'}
        </h2>

        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Modo: <strong>{modeName}</strong>
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 w-full">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">Racha</span>
            <div className="mt-1 text-2xl font-extrabold text-[#e2001a] tabular-nums">
              {score}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">Mejor Racha</span>
            <div className="mt-1 text-2xl font-extrabold text-[var(--foreground)] tabular-nums">
              {bestScore}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-[#e2001a] text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-95 transition-all"
        >
          Volver a jugar
        </button>
      </div>
    </div>
  );
}
