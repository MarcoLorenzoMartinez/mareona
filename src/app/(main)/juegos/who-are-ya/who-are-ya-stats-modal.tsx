// Client: Modal de estadísticas de ¿Quién es? idéntico a Wordle
'use client';

import React from 'react';
import type { WhoAreYaStats } from '@/lib/who-are-ya/storage';

interface WhoAreYaStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WhoAreYaStats;
}

export function WhoAreYaStatsModal({
  isOpen,
  onClose,
  stats,
}: WhoAreYaStatsModalProps) {
  if (!isOpen) return null;

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const attemptsArray = [1, 2, 3, 4, 5, 6];
  const maxGuessCount = Math.max(1, ...Object.values(stats.guessDistribution || {}));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="who-are-ya-stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs"
    >
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera limpia y sutil */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 id="who-are-ya-stats-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
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

        {/* Resumen Métrico */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col rounded-xl bg-neutral-50 p-2.5">
            <span className="text-xl font-black tabular-nums text-neutral-900">{stats.played}</span>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase">Partidas</span>
          </div>
          <div className="flex flex-col rounded-xl bg-neutral-50 p-2.5">
            <span className="text-xl font-black tabular-nums text-emerald-600">{winRate}%</span>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase">% Victoria</span>
          </div>
          <div className="flex flex-col rounded-xl bg-neutral-50 p-2.5">
            <span className="text-xl font-black tabular-nums text-neutral-900">{stats.currentStreak}</span>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase">Racha</span>
          </div>
          <div className="flex flex-col rounded-xl bg-neutral-50 p-2.5">
            <span className="text-xl font-black tabular-nums text-neutral-900">{stats.maxStreak}</span>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase">Máxima</span>
          </div>
        </div>

        {/* Distribución de Intentos */}
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Distribución de Intentos
          </h3>
          <div className="mt-3 flex flex-col gap-1.5">
            {attemptsArray.map((attempt) => {
              const count = stats.guessDistribution?.[attempt] || 0;
              const pct = Math.round((count / maxGuessCount) * 100);

              return (
                <div key={attempt} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right font-bold text-neutral-500 tabular-nums">
                    {attempt}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-md bg-neutral-100">
                    <div
                      className={`flex h-5 items-center justify-end px-2 text-[11px] font-bold text-white transition-all duration-300 ${
                        count > 0 ? 'bg-[#e2001a]' : 'bg-transparent text-neutral-400'
                      }`}
                      style={{ width: `${Math.max(12, pct)}%` }}
                    >
                      <span className="tabular-nums">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
