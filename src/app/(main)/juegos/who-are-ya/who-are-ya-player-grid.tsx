// Client: Grilla de intentos para ¿Quién es? con indicadores visuales de alta legibilidad
'use client';

import React from 'react';
import type { PlayerGuessResult, StatComparison } from '@/lib/who-are-ya/types';
import { getNationalityFlagUrl, getPositionAbbr } from '@/lib/who-are-ya/format';

interface WhoAreYaPlayerGridProps {
  guesses: PlayerGuessResult[];
}

interface TileProps {
  label: string;
  isMatch: boolean;
  children: React.ReactNode;
}

function StatTile({ label, isMatch, children }: TileProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border font-bold transition-all shadow-2xs overflow-hidden ${
          isMatch
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-neutral-200 bg-neutral-100/90 text-neutral-800'
        }`}
      >
        {children}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">
        {label}
      </span>
    </div>
  );
}

function NumericTile({
  label,
  value,
  comparison,
}: {
  label: string;
  value: number;
  comparison: StatComparison;
}) {
  const isMatch = comparison === 'equal';
  const isHigher = comparison === 'higher';
  const isLower = comparison === 'lower';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative flex h-12 w-12 sm:h-14 sm:w-14 flex-col items-center justify-center rounded-xl border tabular-nums transition-all shadow-2xs ${
          isMatch
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-neutral-200 bg-neutral-100/90 text-neutral-900'
        }`}
      >
        {/* Flecha superior si el valor objetivo es MÁS ALTO (▲) */}
        {isHigher && (
          <span
            className="text-[11px] font-black leading-none mb-0.5 text-neutral-500"
            aria-label="Más alto"
          >
            ▲
          </span>
        )}

        <span className="text-xs sm:text-sm font-extrabold leading-none">{value}</span>

        {/* Flecha inferior si el valor objetivo es MÁS BAJO (▼) */}
        {isLower && (
          <span
            className="text-[11px] font-black leading-none mt-0.5 text-neutral-500"
            aria-label="Más bajo"
          >
            ▼
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">
        {label}
      </span>
    </div>
  );
}

export function WhoAreYaPlayerGrid({ guesses }: WhoAreYaPlayerGridProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl mx-auto">
      {guesses.map((guess, idx) => {
        const flagUrl = getNationalityFlagUrl(guess.player.nationality);
        const posAbbr = getPositionAbbr(guess.player.position);

        return (
          <div
            key={`${guess.player.bdfId}-${idx}`}
            className="flex flex-col gap-2.5 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-4 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {/* Cabecera del intento: Nombre deportivo y nombre legal */}
            <div className="flex items-baseline justify-between border-b border-neutral-100 pb-2 px-1">
              <span className="text-sm sm:text-base font-black tracking-tight text-neutral-900">
                {guess.player.name}
              </span>
              <span className="text-xs font-normal text-neutral-400 truncate max-w-[200px]">
                {guess.player.fullName}
              </span>
            </div>

            {/* Fila de 5 indicadores visuales limpios */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 justify-items-center pt-1">
              {/* 1. Nacionalidad: Bandera oficial gráfica */}
              <StatTile label="País" isMatch={guess.nationalityMatch}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagUrl}
                  alt={guess.player.nationality}
                  title={guess.player.nationality}
                  loading="lazy"
                  className="h-7 w-10 sm:h-8 sm:w-11 rounded-sm object-cover shadow-2xs"
                />
              </StatTile>

              {/* 2. Posición: Abreviatura deportiva (POR, DEF, MED, DEL) */}
              <StatTile label="Posición" isMatch={guess.positionMatch}>
                <span
                  className={`text-xs sm:text-sm font-extrabold tracking-wide ${
                    guess.positionMatch ? 'text-white' : 'text-neutral-800'
                  }`}
                  title={guess.player.position}
                >
                  {posAbbr}
                </span>
              </StatTile>

              {/* 3. Partidos */}
              <NumericTile
                label="Partidos"
                value={guess.matchesPlayed.value}
                comparison={guess.matchesPlayed.comparison}
              />

              {/* 4. Goles */}
              <NumericTile
                label="Goles"
                value={guess.goals.value}
                comparison={guess.goals.comparison}
              />

              {/* 5. Año de Debut */}
              <NumericTile
                label="Debut"
                value={guess.startYear.value}
                comparison={guess.startYear.comparison}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
