// Client: Modal de resultado final de ¿Quién es? con estadísticas unificadas (idéntico a Trivia y Wordle)
'use client';

import React from 'react';
import Link from 'next/link';
import { PlayerPhoto } from '@/components/media/player-photo';
import type { WhoAreYaStats } from '@/lib/who-are-ya/storage';

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
  maxAttempts,
  targetName,
  targetSublabel,
  targetPhotoUrl,
  stats,
  onOpenArchive,
}: WhoAreYaResultModalProps) {
  if (!isOpen) return null;

  const winPercentage =
    stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="who-are-ya-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
    >
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
        {/* Cabecera limpia y neutral */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2
            id="who-are-ya-modal-title"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400"
          >
            Estadísticas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Revelación con tarjeta ambiental verde o roja para foto y descripción */}
        <div
          className={`mt-4 flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
            isWon
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-rose-300 bg-rose-50 text-rose-950'
          }`}
        >
          {/* Foto del protagonista descubierta */}
          {targetPhotoUrl && (
            <div className="relative mb-3 flex items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white shadow-2xs p-1">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-white">
                <PlayerPhoto
                  photoUrl={targetPhotoUrl}
                  playerName={targetName}
                  size="lg"
                  className="h-22 w-22 object-contain"
                />
              </div>
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

          {isWon && (
            <span className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              Acertado en {attemptsCount} de {maxAttempts} intentos
            </span>
          )}
        </div>

        {/* Resumen métrico 4 columnas idéntico a Trivia y Wordle */}
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
        <div className="mt-6 flex items-center gap-2.5">
          <Link
            href="/juegos"
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all"
          >
            Volver a Juegos
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenArchive();
            }}
            className="flex-1 rounded-xl bg-[#e2001a] py-2.5 text-center text-xs font-bold text-white hover:bg-[#c00016] active:scale-98 transition-all shadow-xs"
          >
            Jugar archivo
          </button>
        </div>
      </div>
    </div>
  );
}
