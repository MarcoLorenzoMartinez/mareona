// Client: Modal de resultado final de ¿Quién es? idéntico al de La pregunta del día + distribución
'use client';

import React from 'react';
import Link from 'next/link';
import { PlayerPhoto } from '@/components/media/player-photo';
import type { WhoAreYaStats } from '@/lib/who-are-ya/storage';
import { useModalA11y } from '@/lib/ui/use-modal-a11y';
import { getDictionary } from '@/i18n';

interface WhoAreYaResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWon: boolean;
  attemptsCount: number;
  maxAttempts: number;
  targetName: string;
  targetSublabel?: string;
  targetPhotoUrl?: string;
  stats: WhoAreYaStats;
  onOpenArchive: () => void;
}

export function WhoAreYaResultModal({
  isOpen,
  onClose,
  isWon,
  targetName,
  targetSublabel,
  targetPhotoUrl,
  stats,
  onOpenArchive,
}: WhoAreYaResultModalProps) {
  const dict = getDictionary();
  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const attemptsArray = [1, 2, 3, 4, 5, 6];
  const maxGuessCount = Math.max(1, ...Object.values(stats.guessDistribution || {}));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="who-are-ya-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-sm flex-col overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera limpia y neutral idéntica a La pregunta del día */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 id="who-are-ya-modal-title" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            {dict.games.whoAreYa.statsModal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] -mr-2"
            aria-label={dict.games.whoAreYa.statsModal.closeModalAria}
          >
            ✕
          </button>
        </div>

        {/* Revelación con tarjeta ambiental verde o roja idéntica a La pregunta del día */}
        <div
          className={`mt-4 flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
            isWon
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-rose-300 bg-rose-50 text-rose-950'
          }`}
        >
          {targetPhotoUrl && (
            <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-xl shadow-xs">
              <PlayerPhoto
                photoUrl={targetPhotoUrl}
                playerName={targetName}
                size="custom"
                className="h-full w-full object-cover object-top"
              />
            </div>
          )}

          <h3 className="text-2xl font-black tracking-tight text-neutral-900">
            {targetName}
          </h3>

          {targetSublabel && (
            <p className="mt-1 text-xs font-medium text-neutral-600 px-1">
              {targetSublabel}
            </p>
          )}
        </div>

        {/* Resumen métrico 4 columnas idéntico a Trivia y Wordle */}
        <div className="mt-5 grid grid-cols-4 items-center border-y border-neutral-100 py-3.5 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{dict.games.whoAreYa.statsModal.played}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{stats.played}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{dict.games.whoAreYa.statsModal.winRate}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{winPercentage}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{dict.games.whoAreYa.statsModal.currentStreak}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-[#e2001a]">{stats.currentStreak}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{dict.games.whoAreYa.statsModal.maxStreak}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{stats.maxStreak}</span>
          </div>
        </div>

        {/* Distribución de intentos unificada con Wordle */}
        <div className="mt-4 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {dict.games.whoAreYa.statsModal.distributionTitle}
          </span>
          <div className="mt-2.5 space-y-1.5">
            {attemptsArray.map((attempt) => {
              const count = stats.guessDistribution?.[attempt] || 0;
              const percentage = Math.round((count / maxGuessCount) * 100);
              return (
                <div key={attempt} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-neutral-600 tabular-nums">{attempt}</span>
                  <div className="flex h-5 flex-1 items-center overflow-hidden rounded-sm bg-neutral-100">
                    <div
                      className={`flex h-full items-center justify-end px-1.5 text-[11px] font-bold text-white transition-all duration-300 ${
                        count > 0 ? 'bg-[#e2001a]' : 'bg-transparent text-neutral-600'
                      }`}
                      style={{ width: `${Math.max(count > 0 ? 12 : 0, percentage)}%` }}
                    >
                      {count > 0 ? <span className="tabular-nums">{count}</span> : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones principales */}
        <div className="mt-6 flex items-center gap-2.5">
          <Link
            href="/juegos"
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.games.whoAreYa.statsModal.backToGames}
          </Link>
          <button
            type="button"
            onClick={() => { onClose(); onOpenArchive(); }}
            className="flex-1 rounded-xl bg-[#e2001a] py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.games.whoAreYa.statsModal.playArchive}
          </button>
        </div>
      </div>
    </div>
  );
}
