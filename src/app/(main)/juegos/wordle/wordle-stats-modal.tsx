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
  const attemptsArray = [1, 2, 3, 4, 5, 6, 7];
  const maxGuessCount = Math.max(1, ...Object.values(stats.guessDistribution || {}));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-sm flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="stats-title" className="text-base font-bold text-[var(--foreground)]">
            Estadísticas del Jugador
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

        {/* Resumen numérico */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{stats.played}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Partidas</div>
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{winRate}%</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Aciertos</div>
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[#e2001a] tabular-nums">{stats.currentStreak}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Racha actual</div>
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{stats.maxStreak}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">Mejor racha</div>
          </div>
        </div>

        {/* Distribución de intentos */}
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
            Distribución de Intentos
          </h3>
          <div className="space-y-1.5">
            {attemptsArray.map((attempt) => {
              const count = stats.guessDistribution?.[attempt] || 0;
              const percentage = Math.round((count / maxGuessCount) * 100);

              return (
                <div key={attempt} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-[var(--foreground-muted)] tabular-nums">
                    {attempt}
                  </span>
                  <div className="flex-1 rounded-sm bg-zinc-100 overflow-hidden h-5 flex items-center">
                    <div
                      className={`h-full flex items-center justify-end px-1.5 text-[11px] font-bold text-white transition-all duration-300 ${
                        count > 0 ? 'bg-[#e2001a]' : 'bg-transparent text-zinc-400'
                      }`}
                      style={{ width: `${Math.max(count > 0 ? 12 : 0, percentage)}%` }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[#e2001a] py-2.5 text-xs font-bold text-white hover:bg-[#b30015] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
