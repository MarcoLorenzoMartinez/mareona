// Client: Clasificación de La Porra con selector segmentado Todos / Amigos y pronósticos de jornada
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  filterAndRankLeaderboard,
  type PorraLeaderboardFilter,
} from '@/lib/porra/leaderboard';
import { PorraLeaderboardRow } from './porra-leaderboard-row';
import type { PorraLeaderboardEntry } from '@/lib/porra/types';

interface PorraLeaderboardProps {
  readonly entries: readonly PorraLeaderboardEntry[];
  readonly currentUserScore?: number;
  readonly canRevealPredictions?: boolean;
  readonly isAuthenticated?: boolean;
  readonly friendsCount?: number;
  readonly onOpenAuth?: () => void;
}

const FILTER_TABS: readonly { readonly id: PorraLeaderboardFilter; readonly label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'friends', label: 'Amigos' },
];

export function PorraLeaderboard({
  entries,
  currentUserScore,
  canRevealPredictions = false,
  isAuthenticated = false,
  friendsCount = 0,
  onOpenAuth,
}: PorraLeaderboardProps) {
  const [activeFilter, setActiveFilter] = useState<PorraLeaderboardFilter>('all');

  const handleTabChange = (tab: PorraLeaderboardFilter) => {
    if (tab === 'friends' && !isAuthenticated && onOpenAuth) {
      onOpenAuth();
      return;
    }
    setActiveFilter(tab);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = FILTER_TABS.findIndex((t) => t.id === activeFilter);
    const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % 2 : (idx + 1) % 2;
    handleTabChange(FILTER_TABS[nextIdx]!.id);
  };

  const visibleEntries = filterAndRankLeaderboard(entries, activeFilter);

  return (
    <section
      aria-label="Clasificación de La Porra"
      className="flex flex-col gap-3.5 rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-7 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3.5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Clasificación
          </h2>
          {currentUserScore !== undefined && (
            <span className="text-xs font-semibold text-neutral-500">
              Tus puntos:{' '}
              <span className="font-bold text-[#e2001a] tabular-nums">{currentUserScore}</span>
            </span>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filtro de clasificación"
          onKeyDown={handleKeyDown}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(tab.id)}
                className={`min-h-8 rounded-full px-3.5 sm:px-4 text-xs sm:text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary)] font-bold text-white shadow-2xs'
                    : 'font-semibold text-neutral-700 hover:bg-[var(--surface)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeFilter === 'friends' && friendsCount === 0 ? (
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <p className="text-xs text-neutral-500">
            Aún no tienes amigos añadidos para comparar vuestros pronósticos.
          </p>
          <Link
            href="/social"
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-bold text-neutral-800 hover:border-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Buscar amigos en Social
          </Link>
        </div>
      ) : visibleEntries.length === 0 ? (
        <p className="text-xs text-neutral-500 text-center py-6">
          Aún no hay puntuaciones registradas. Envía tu pronóstico para estrenar la tabla.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-100">
          {visibleEntries.map((entry) => (
            <PorraLeaderboardRow
              key={entry.userId ?? `${entry.userName}-${entry.rank}`}
              entry={entry}
              showPick={
                Boolean(entry.currentPrediction) &&
                (activeFilter === 'friends' || Boolean(entry.isCurrentUser))
              }
              canRevealPredictions={canRevealPredictions}
            />
          ))}
        </div>
      )}
    </section>
  );
}
