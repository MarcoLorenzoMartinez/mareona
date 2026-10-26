import React from 'react';
import Link from 'next/link';
import type { WordleDailyWord, WordleStats } from '@/lib/wordle/types';

interface WordleStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WordleStats;
  challenge: WordleDailyWord;
  isGameOver: boolean;
  onOpenArchive?: () => void;
  onResetStats?: () => void;
}

export function WordleStatsModal({
  isOpen,
  onClose,
  stats,
  challenge,
  isGameOver,
  onOpenArchive,
  onResetStats,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs"
    >
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera limpia y sutil */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 id="stats-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Estadísticas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar estadísticas"
          >
            ✕
          </button>
        </div>

        {/* Revelación de palabra y trivia */}
        {isGameOver && (
          <div className="mt-4 text-center">
            <h3 className="text-3xl font-black tracking-tight text-[#e2001a]">
              {challenge.word}
            </h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-600 text-center">
              {challenge.trivia}
            </p>
          </div>
        )}

        {/* Resumen de métricas idéntico a Mayor o Menor */}
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
              {winRate}%
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

        {/* Distribución de intentos */}
        <div className="mt-4 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Distribución de intentos
          </span>
          <div className="mt-2.5 space-y-1.5">
            {attemptsArray.map((attempt) => {
              const count = stats.guessDistribution?.[attempt] || 0;
              const percentage = Math.round((count / maxGuessCount) * 100);

              return (
                <div key={attempt} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-neutral-400 tabular-nums">
                    {attempt}
                  </span>
                  <div className="flex-1 rounded-sm bg-neutral-100 overflow-hidden h-5 flex items-center">
                    <div
                      className={`h-full flex items-center justify-end px-1.5 text-[11px] font-bold text-white transition-all duration-300 ${count > 0 ? "bg-[#e2001a]" : "bg-transparent text-neutral-400"}`}
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

        {/* Acciones principales: Volver a juegos + CTA primario para seguir jugando (Archivo o Cerrar) */}
        <div className="mt-6 grid grid-cols-2 gap-3 w-full">
          <Link
            href="/juegos"
            className="flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs sm:text-sm font-bold text-neutral-600 shadow-2xs hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.97] transition-all select-none text-center"
          >
            Volver a juegos
          </Link>

          {isGameOver && onOpenArchive ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenArchive();
              }}
              className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:from-[#c70017] hover:to-[#a80013] active:scale-[0.97] transition-all select-none text-center"
            >
              Jugar anteriores
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:from-[#c70017] hover:to-[#a80013] active:scale-[0.97] transition-all select-none text-center"
            >
              Cerrar
            </button>
          )}
        </div>

        {onResetStats && (
          <button
            type="button"
            onClick={onResetStats}
            className="mt-3 text-center text-[11px] font-medium text-neutral-400 hover:text-rose-600 transition-colors"
          >
            Reiniciar mis partidas y estadísticas
          </button>
        )}
      </div>
    </div>
  );
}
