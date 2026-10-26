import React from 'react';
import Link from 'next/link';
import { WhoAreYaModeSelector } from './who-are-ya-mode-selector';
import type { WhoAreYaGameMode } from '@/lib/who-are-ya/types';

interface WhoAreYaHeaderProps {
  currentMode: WhoAreYaGameMode;
  onSelectMode: (mode: WhoAreYaGameMode) => void;
  selectedDate: string;
  isToday: boolean;
  onOpenArchive: () => void;
}

export function WhoAreYaHeader({
  currentMode,
  onSelectMode,
  selectedDate,
  isToday,
  onOpenArchive,
}: WhoAreYaHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/juegos"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
          aria-label="Volver a juegos"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Who Are Ya?
            </h1>
            {!isToday && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {selectedDate}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            {currentMode === 'players' ? 'Adivina el futbolista del Sporting de hoy' : 'Identifica la camiseta histórica de hoy'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <WhoAreYaModeSelector currentMode={currentMode} onSelectMode={onSelectMode} />

        <button
          type="button"
          onClick={onOpenArchive}
          title="Ver calendario y archivo de retos anteriores"
          aria-label="Archivo de retos"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-all active:scale-95 shadow-2xs"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
