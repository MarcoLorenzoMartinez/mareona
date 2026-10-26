// Client: Modal de resultado final de Who Are Ya alineado con el diseño de los otros juegos
'use client';

import React from 'react';
import Link from 'next/link';
import type { WhoAreYaGameMode } from '@/lib/who-are-ya/types';

interface WhoAreYaResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWon: boolean;
  attemptsCount: number;
  maxAttempts: number;
  mode: WhoAreYaGameMode;
  targetName: string;
  targetSublabel?: string;
  onOpenArchive: () => void;
}

export function WhoAreYaResultModal({
  isOpen,
  onClose,
  isWon,
  attemptsCount,
  maxAttempts,
  mode,
  targetName,
  targetSublabel,
  onOpenArchive,
}: WhoAreYaResultModalProps) {
  if (!isOpen) return null;

  const modeLabel = mode === 'players' ? 'Futbolista' : 'Camiseta';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="who-are-ya-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
    >
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
        {/* Cabecera sutil idéntica a Wordle, Trivia y Mayor o Menor */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {isWon ? '¡Has acertado!' : 'Fin de la partida'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Revelación destacada */}
        <div className="mt-4 text-center">
          <span className="text-[11px] font-bold tracking-widest text-[#e2001a] uppercase">
            {mode === 'players' ? 'Futbolista misterioso' : 'Camiseta histórica'}
          </span>
          <h3
            id="who-are-ya-modal-title"
            className="mt-1 text-2xl font-black tracking-tight text-neutral-900"
          >
            {targetName}
          </h3>
          {targetSublabel && (
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              {targetSublabel}
            </p>
          )}
        </div>

        {/* Resumen métrico simétrico */}
        <div className="mt-5 grid grid-cols-2 items-center border-y border-neutral-100 py-3.5 text-center">
          <div className="flex flex-col items-center justify-center border-r border-neutral-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Intentos
            </span>
            <span
              className={`mt-1 text-2xl font-black tabular-nums ${
                isWon ? 'text-emerald-600' : 'text-[#e2001a]'
              }`}
            >
              {isWon ? attemptsCount : 'X'}
              <span className="text-sm font-semibold text-neutral-400">
                /{maxAttempts}
              </span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Modo
            </span>
            <span className="mt-1 text-sm font-bold text-neutral-900">
              {modeLabel}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 grid grid-cols-2 gap-3 w-full">
          <Link
            href="/juegos"
            className="flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-[0.97] transition-all select-none text-center"
          >
            Volver a juegos
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenArchive();
            }}
            className="flex h-11 items-center justify-center rounded-full bg-[#e2001a] px-3 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.97] transition-all select-none text-center"
          >
            Ver archivo
          </button>
        </div>
      </div>
    </div>
  );
}
