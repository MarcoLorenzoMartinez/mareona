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
      {/* Contenedor principal con feedback de estado nítido */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all ${
          isCorrect
            ? 'border-emerald-300 bg-emerald-50/70 text-neutral-900 shadow-xs'
            : 'border-neutral-200 bg-[var(--surface)] text-neutral-900'
        }`}
      >
        {/* Badge de veredicto superior */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              isCorrect
                ? 'bg-emerald-600 text-white'
                : 'bg-[#e2001a] text-white'
            }`}
          >
            <span>{isCorrect ? '✓' : '✕'}</span>
            <span>{isCorrect ? '¡Has acertado!' : 'Has fallado'}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Foto con marco ultra fino */}
          <div className="relative shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xs">
            {isLocalImage && photoUrl ? (
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                <Image
                  src={photoUrl}
                  alt={canonicalAnswer}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center p-1 bg-white">
                <PlayerPhoto
                  photoUrl={photoUrl}
                  playerName={canonicalAnswer}
                  size="md"
                  className="h-26 w-26 object-contain"
                />
              </div>
            )}
          </div>

          {/* Información principal limpia: Respuesta correcta y explicación */}
          <div className="flex flex-1 flex-col text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">
              {isCorrect ? 'Tu acierto' : 'Respuesta correcta'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
              {canonicalAnswer}
            </h3>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-700">
              {explanation}
            </p>

            {/* Si falló, mostramos qué había puesto */}
            {!isCorrect && (
              <p className="mt-3 text-[11px] text-neutral-600 font-medium">
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
