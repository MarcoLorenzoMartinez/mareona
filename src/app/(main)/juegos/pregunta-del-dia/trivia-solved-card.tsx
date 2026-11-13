// Client: Clean solved state card for trivia challenge aligned with Mareona's design system
'use client';

import React from 'react';
import Image from 'next/image';
import { PlayerPhoto } from '@/components/media/player-photo';

interface TriviaSolvedCardProps {
  isCorrect: boolean;
  userAnswer: string;
  canonicalAnswer: string;
  explanation: string;
  photoUrl?: string;
  onOpenStats: () => void;
}

export function TriviaSolvedCard({
  isCorrect,
  userAnswer,
  canonicalAnswer,
  explanation,
  photoUrl,
  onOpenStats,
}: TriviaSolvedCardProps) {
  const isLocalImage = photoUrl?.startsWith('/') || photoUrl?.startsWith('/images') || photoUrl?.startsWith('/stadiums');

  return (
    <div className="mt-8 flex flex-col gap-4 animate-in fade-in zoom-in-98 duration-200">
      {/* Contenedor principal con tono ambiental verde o rojo idéntico al popup */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-2xs transition-all ${
          isCorrect
            ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
            : 'border-rose-300 bg-rose-50 text-rose-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Foto a sangre sin marco blanco de relleno */}
          <div className="relative shrink-0 overflow-hidden rounded-xl shadow-xs">
            {isLocalImage && photoUrl ? (
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-xl">
                <Image
                  src={photoUrl}
                  alt={canonicalAnswer}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-xl">
                <PlayerPhoto
                  photoUrl={photoUrl}
                  playerName={canonicalAnswer}
                  size="custom"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            )}
          </div>

          {/* Información principal limpia: Respuesta y crónica */}
          <div className="flex flex-1 flex-col text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
              {canonicalAnswer}
            </h3>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-700">
              {explanation}
            </p>

            {/* Si falló, mostramos qué había puesto */}
            {!isCorrect && (
              <p className="mt-3 text-[11px] text-neutral-500 font-medium">
                Tu respuesta:{' '}
                <span className="line-through text-neutral-400 font-normal">
                  {userAnswer}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botón para ver estadísticas */}
      <button
        type="button"
        onClick={onOpenStats}
        className="mt-1 flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98] transition-all select-none"
      >
        Ver mis Estadísticas
      </button>
    </div>
  );
}
