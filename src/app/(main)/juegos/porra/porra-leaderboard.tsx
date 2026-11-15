// Client: Clasificación minimalista de La Porra con paginación de 10 en 10 y salto a posición propia
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
  readonly isAuthenticated?: boolean;
  readonly friendsCount?: number;
  readonly onOpenAuth?: () => void;
}

const PAGE_SIZE = 10;

const FILTER_TABS: readonly { readonly id: PorraLeaderboardFilter; readonly label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'friends', label: 'Amigos' },
];

export function PorraLeaderboard({
  entries,
  currentUserScore,
  isAuthenticated = false,
  friendsCount = 0,
  onOpenAuth,
}: PorraLeaderboardProps) {
  const [activeFilter, setActiveFilter] = useState<PorraLeaderboardFilter>('all');
  const [page, setPage] = useState(1);

  const handleTabChange = (tab: PorraLeaderboardFilter) => {
    if (tab === 'friends' && !isAuthenticated && onOpenAuth) {
      onOpenAuth();
      return;
    }
    setActiveFilter(tab);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = FILTER_TABS.findIndex((t) => t.id === activeFilter);
    const nextIdx = (idx + 1) % 2;
    handleTabChange(FILTER_TABS[nextIdx]!.id);
  };

  const visibleEntries = filterAndRankLeaderboard(entries, activeFilter);
  const totalPages = Math.max(1, Math.ceil(visibleEntries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageEntries = visibleEntries.slice(startIdx, startIdx + PAGE_SIZE);

  const userIndex = visibleEntries.findIndex((e) => Boolean(e.isCurrentUser));
  const userEntry = userIndex >= 0 ? visibleEntries[userIndex] : undefined;
  const userPage = userIndex >= 0 ? Math.floor(userIndex / PAGE_SIZE) + 1 : null;
  const isOnUserPage = userPage !== null && safePage === userPage;

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

        <div className="flex items-center gap-2">
          {userEntry && userPage !== null && totalPages > 1 && (
            <button
              type="button"
              onClick={() => setPage(userPage)}
              disabled={isOnUserPage}
              className={`min-h-8 rounded-full px-3 text-xs font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                isOnUserPage
                  ? 'border border-[var(--border)] bg-[var(--surface)] text-neutral-400 cursor-default'
                  : 'border border-[#e2001a]/30 bg-red-50/50 text-[#e2001a] hover:bg-red-50 cursor-pointer'
              }`}
            >
              Ir a mi posición (#{userEntry.rank})
            </button>
          )}

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
        <>
          <div className="flex flex-col gap-1">
            {pageEntries.map((entry) => (
              <PorraLeaderboardRow
                key={entry.userId ?? `${entry.userName}-${entry.rank}`}
                entry={entry}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, Math.min(p, totalPages) - 1))}
                disabled={safePage <= 1}
                className="min-h-8 rounded-full border border-[var(--border)] bg-white px-3.5 py-1 text-xs font-bold text-neutral-700 transition-colors hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                Anterior
              </button>
              <span className="font-sans text-xs font-semibold tabular-nums text-neutral-500">
                Página {safePage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))}
                disabled={safePage >= totalPages}
                className="min-h-8 rounded-full border border-[var(--border)] bg-white px-3.5 py-1 text-xs font-bold text-neutral-700 transition-colors hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
