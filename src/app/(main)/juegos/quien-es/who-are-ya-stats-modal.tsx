// Client: Modal de estadísticas de ¿Quién es? idéntico a Wordle
"use client";

import React from "react";
import type { WhoAreYaStats } from "@/lib/who-are-ya/storage";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { getDictionary } from "@/i18n";

interface WhoAreYaStatsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly stats: WhoAreYaStats;
}

export function WhoAreYaStatsModal({
  isOpen,
  onClose,
  stats,
}: WhoAreYaStatsModalProps) {
  const dict = getDictionary();
  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const attemptsArray = [1, 2, 3, 4, 5, 6];
  const maxGuessCount = Math.max(1, ...Object.values(stats.guessDistribution || {}));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="who-are-ya-stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera limpia y sutil */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 id="who-are-ya-stats-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            {dict.games.whoAreYa.statsModal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] -mr-2"
            aria-label={dict.games.whoAreYa.statsModal.closeAria}
          >
            ✕
          </button>
        </div>

        {/* Resumen Métrico unificado con Wordle y Trivia */}
        <div className="mt-4 grid grid-cols-4 items-center border-y border-neutral-100 py-3.5 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.whoAreYa.statsModal.played}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{stats.played}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.whoAreYa.statsModal.winRate}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{winRate}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.whoAreYa.statsModal.currentStreak}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-[#e2001a]">{stats.currentStreak}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.whoAreYa.statsModal.maxStreak}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{stats.maxStreak}</span>
          </div>
        </div>

        {/* Distribución de Intentos */}
        <div className="mt-4 pt-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {dict.games.whoAreYa.statsModal.distributionTitle}
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
                        count > 0 ? "bg-[#e2001a]" : "bg-transparent text-neutral-400"
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
