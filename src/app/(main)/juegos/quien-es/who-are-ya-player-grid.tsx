// Client: Grilla de intentos para ¿Quién es? con indicadores visuales de alta legibilidad
'use client';

import React from 'react';
import Image from 'next/image';
import type { PlayerGuessResult, StatComparison } from '@/lib/who-are-ya/types';
import { getNationalityFlagUrl, getPositionAbbr } from '@/lib/who-are-ya/format';
import { getDictionary } from '@/i18n';

interface WhoAreYaPlayerGridProps {
  guesses: PlayerGuessResult[];
}

interface TileProps {
  label: string;
  shortLabel?: string;
  isMatch: boolean;
  children: React.ReactNode;
}

interface NumericTileProps {
  label: string;
  shortLabel?: string;
  value: number;
  comparison: StatComparison;
}

function TileLabel({ label, shortLabel }: { label: string; shortLabel?: string }) {
  const baseClass = 'text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none';
  if (!shortLabel) return <span className={baseClass}>{label}</span>;

  return (
    <span className={baseClass} title={label}>
      <span className="sr-only">{label}</span>
      <span className="sm:hidden" aria-hidden="true">{shortLabel}</span>
      <span className="hidden sm:inline" aria-hidden="true">{label}</span>
    </span>
  );
}

function StatTile({ label, shortLabel, isMatch, children }: TileProps) {
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
      <TileLabel label={label} shortLabel={shortLabel} />
    </div>
  );
}

function NumericTile({ label, shortLabel, value, comparison }: NumericTileProps) {
  const dict = getDictionary();
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
        {/* Triángulo superior sólido si el valor objetivo es MÁS ALTO (▲) */}
        {isHigher && (
          <span
            className="text-[11px] font-black leading-none mb-0.5 text-neutral-500"
            aria-label={dict.games.whoAreYa.grid.higherAria}
          >
            ▲
          </span>
        )}

        <span className="text-xs sm:text-sm font-extrabold leading-none">{value}</span>

        {/* Triángulo inferior sólido si el valor objetivo es MÁS BAJO (▼) */}
        {isLower && (
          <span
            className="text-[11px] font-black leading-none mt-0.5 text-neutral-500"
            aria-label={dict.games.whoAreYa.grid.lowerAria}
          >
            ▼
          </span>
        )}
      </div>
      <TileLabel label={label} shortLabel={shortLabel} />
    </div>
  );
}

export function WhoAreYaPlayerGrid({ guesses }: WhoAreYaPlayerGridProps) {
  const { grid } = getDictionary().games.whoAreYa;
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
              <StatTile label={grid.country} isMatch={guess.nationalityMatch}>
                <Image
                  src={flagUrl}
                  alt={guess.player.nationality}
                  title={guess.player.nationality}
                  width={44}
                  height={32}
                  loading="lazy"
                  className="h-7 w-10 sm:h-8 sm:w-11 rounded-sm object-cover shadow-2xs"
                />
              </StatTile>

              {/* 2. Posición: Abreviatura deportiva (POR, DEF, MED, DEL) */}
              <StatTile label={grid.position} shortLabel={grid.positionShort} isMatch={guess.positionMatch}>
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
                label={grid.matches}
                shortLabel={grid.matchesShort}
                value={guess.matchesPlayed.value}
                comparison={guess.matchesPlayed.comparison}
              />

              {/* 4. Goles */}
              <NumericTile label={grid.goals} value={guess.goals.value} comparison={guess.goals.comparison} />

              {/* 5. Año de Debut */}
              <NumericTile label={grid.debut} value={guess.startYear.value} comparison={guess.startYear.comparison} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
