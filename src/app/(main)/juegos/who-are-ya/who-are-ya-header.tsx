import React from 'react';
import Link from 'next/link';
import { WhoAreYaModeSelector } from './who-are-ya-mode-selector';
import type { WhoAreYaGameMode } from '@/lib/who-are-ya/types';

interface WhoAreYaHeaderProps {
  currentMode: WhoAreYaGameMode;
  onSelectMode: (mode: WhoAreYaGameMode) => void;
  attemptsCount: number;
  maxAttempts: number;
  onReset: () => void;
}

export function WhoAreYaHeader({
  currentMode,
  onSelectMode,
  attemptsCount,
  maxAttempts,
  onReset,
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
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Who Are Ya?
          </h1>
          <p className="text-xs text-[var(--foreground-muted)]">
            {currentMode === 'players' ? 'Adivina el futbolista rojiblanco' : 'Identifica la camiseta histórica'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <WhoAreYaModeSelector currentMode={currentMode} onSelectMode={onSelectMode} />

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold tabular-nums text-[var(--foreground)] border border-[var(--border)]">
            {attemptsCount}/{maxAttempts}
          </span>
          <button
            type="button"
            onClick={onReset}
            title="Reiniciar con otro reto aleatorio"
            aria-label="Nuevo reto"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-all active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
