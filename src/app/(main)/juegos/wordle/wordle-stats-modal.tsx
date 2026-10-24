import React from 'react';
import type { WordleDailyWord, WordleStats } from '@/lib/wordle/types';

interface WordleStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WordleStats;
  challenge: WordleDailyWord;
  isGameOver: boolean;
  hasWon: boolean;
}

export function WordleStatsModal({
  isOpen,
  onClose,
  stats,
  challenge,
  isGameOver,
  hasWon,
}: WordleStatsModalProps) {
  if (!isOpen) return null;

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs"
    >
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="stats-title" className="text-base font-bold text-[var(--foreground)]">
            Estadísticas Sportinguistas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar estadísticas"
          >
            ✕
          </button>
        </div>

        {isGameOver && (
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
            <span className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
              {hasWon ? '¡Acertaste la palabra!' : 'Palabra secreta'}
            </span>
            <div className="mt-1 text-xl font-extrabold tracking-wider text-[#e2001a]">
              {challenge.word}
            </div>
            <p className="mt-2 text-xs text-[var(--foreground)] leading-relaxed italic text-left">
              «{challenge.trivia}»
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{stats.played}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Jugadas</div>
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{winRate}%</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Victorias</div>
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[#e2001a] tabular-nums">{stats.currentStreak}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Racha</div>
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{stats.maxStreak}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Máxima</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[#e2001a] py-2.5 text-xs font-bold text-white hover:bg-[#b30015] transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
