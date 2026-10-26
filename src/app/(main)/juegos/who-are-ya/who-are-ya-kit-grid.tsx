import React from 'react';
import Image from 'next/image';
import type { KitGuessResult } from '@/lib/who-are-ya/types';

interface WhoAreYaKitGridProps {
  guesses: KitGuessResult[];
}

export function WhoAreYaKitGrid({ guesses }: WhoAreYaKitGridProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xl mx-auto">
      {guesses.map((guess, idx) => (
        <div
          key={`${guess.kit.id}-${idx}`}
          className={`flex items-center justify-between rounded-2xl border p-3 shadow-2xs transition-all animate-in fade-in-50 duration-200 ${
            guess.isCorrect
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-[var(--border)] bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              <Image
                src={guess.kit.image}
                alt={guess.kit.label}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--foreground)]">
                {guess.kit.label}
              </span>
              <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                {guess.kit.details}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                guess.seasonMatch
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--surface)] text-[var(--foreground-muted)]'
              }`}
            >
              {guess.kit.season}
              {!guess.seasonMatch && guess.yearComparison !== 'equal' && (
                <span className="ml-1 text-amber-500 font-bold">
                  {guess.yearComparison === 'higher' ? '↑' : '↓'}
                </span>
              )}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                guess.typeMatch
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--surface)] text-[var(--foreground-muted)]'
              }`}
            >
              {guess.kit.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
