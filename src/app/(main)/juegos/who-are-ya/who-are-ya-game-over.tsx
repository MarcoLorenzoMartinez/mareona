// Client: Modal de resultado final y estadísticas de ¿Quién es? unificado con Wordle
'use client';

import React from 'react';
import Link from 'next/link';
import { PlayerPhoto } from '@/components/media/player-photo';
import type { WhoAreYaStats } from '@/lib/who-are-ya/storage';
import { useModalA11y } from '@/lib/ui/use-modal-a11y';

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
  attemptsCount,
  targetName,
  targetSublabel,
  targetPhotoUrl,
  stats,
  onOpenArchive,
}: WhoAreYaResultModalProps) {
  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const attemptsArray = [1, 2, 3, 4, 5, 6];
  const maxGuessCount = Math.max(1, ...Object.values(stats.guessDistribution || {}));
  const statusLabel = isWon
    ? attemptsCount === 1
      ? '¡Acertado al 1.er intento!'
      : `¡Acertado en ${attemptsCount} intentos!`
    : 'No acertado';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="who-are-ya-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 id="who-are-ya-modal-title" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Estadísticas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Ficha horizontal del jugador con toque semántico verde/rojo sobrio */}
        <div
          className={`mt-4 flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all ${
            isWon
              ? 'border-emerald-200 bg-emerald-50/65 text-emerald-950'
              : 'border-rose-200 bg-rose-50/65 text-rose-950'
          }`}
        >
          {targetPhotoUrl && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/90 bg-white p-0.5 shadow-2xs">
              <PlayerPhoto
                photoUrl={targetPhotoUrl}
                playerName={targetName}
                size="lg"
                className="h-15 w-15 object-contain rounded-lg"
              />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col text-left">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isWon ? 'text-emerald-700' : 'text-rose-700'}`}>
              {statusLabel}
            </span>
            <h3 className="truncate text-xl font-black tracking-tight text-neutral-900">{targetName}</h3>
            {targetSublabel && (
              <p className="truncate text-xs font-medium text-neutral-500">{targetSublabel}</p>
            )}
          </div>
        </div>

        {/* Resumen métrico 4 columnas idéntico a Trivia y Wordle */}
        <div className="mt-4 grid grid-cols-4 items-center border-y border-neutral-100 py-3 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Partidas</span>
            <span className="mt-0.5 text-2xl font-black tabular-nums text-neutral-900">{stats.played}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Aciertos</span>
            <span className="mt-0.5 text-2xl font-black tabular-nums text-neutral-900">{winPercentage}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Racha</span>
            <span className="mt-0.5 text-2xl font-black tabular-nums text-[#e2001a]">{stats.currentStreak}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Máxima</span>
            <span className="mt-0.5 text-2xl font-black tabular-nums text-neutral-900">{stats.maxStreak}</span>
          </div>
        </div>

        {/* Distribución de intentos unificada con Wordle */}
        <div className="mt-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Distribución de intentos
          </span>
          <div className="mt-2 space-y-1.5">
            {attemptsArray.map((attempt) => {
              const count = stats.guessDistribution?.[attempt] || 0;
              const percentage = Math.round((count / maxGuessCount) * 100);
              return (
                <div key={attempt} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-neutral-400 tabular-nums">{attempt}</span>
                  <div className="flex h-5 flex-1 items-center overflow-hidden rounded-sm bg-neutral-100">
                    <div
                      className={`flex h-full items-center justify-end px-1.5 text-[11px] font-bold text-white transition-all duration-300 ${
                        count > 0 ? 'bg-[#e2001a]' : 'bg-transparent text-neutral-400'
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

        <div className="mt-5 flex items-center gap-2.5">
          <Link
            href="/juegos"
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all"
          >
            Volver a Juegos
          </Link>
          <button
            type="button"
            onClick={() => { onClose(); onOpenArchive(); }}
            className="flex-1 rounded-xl bg-[#e2001a] py-2.5 text-center text-xs font-bold text-white hover:bg-[#c00016] active:scale-98 transition-all shadow-xs"
          >
            Jugar archivo
          </button>
        </div>
      </div>
    </div>
  );
}
