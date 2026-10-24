import React from 'react';
import type { WordleDailyWord } from '@/lib/wordle/types';

interface WordleHeaderProps {
  challenge: WordleDailyWord;
  isArchive: boolean;
  onOpenArchive: () => void;
  onOpenStats: () => void;
}

export function WordleHeader({
  challenge,
  isArchive,
  onOpenArchive,
  onOpenStats,
}: WordleHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] pb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Wordle Sportinguista
          </span>
          {isArchive && (
            <span className="rounded-full bg-zinc-100 text-zinc-700 px-2 py-0.5 text-[10px] font-semibold border border-zinc-200">
              Modo Histórico
            </span>
          )}
        </div>
        <h1 className="mt-1 text-lg font-bold text-[var(--foreground)]">
          Reto {challenge.id}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenArchive}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          aria-label="Abrir archivo de palabras"
        >
          <span>Archivo</span>
        </button>

        <button
          type="button"
          onClick={onOpenStats}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          aria-label="Ver estadísticas del usuario"
        >
          <span>Estadísticas</span>
        </button>
      </div>
    </header>
  );
}
