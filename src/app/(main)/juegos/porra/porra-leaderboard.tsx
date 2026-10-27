// Client: Tabla de clasificación general de La Porra
'use client';

import React from 'react';
import type { PorraLeaderboardEntry } from '@/lib/porra/types';

interface PorraLeaderboardProps {
  entries: PorraLeaderboardEntry[];
  currentUserScore?: number;
}

export function PorraLeaderboard({
  entries,
  currentUserScore,
}: PorraLeaderboardProps) {
  return (
    <section
      aria-label="Clasificación general"
      className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-7 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Clasificación General
        </h2>
        {currentUserScore !== undefined && (
          <span className="text-xs font-semibold text-neutral-500">
            Tus puntos: <span className="font-bold text-[#e2001a] tabular-nums">{currentUserScore}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col divide-y divide-neutral-100">
        {entries.map((entry) => {
          const isTop3 = entry.rank <= 3;
          const rankBadgeColor =
            entry.rank === 1
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : entry.rank === 2
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : entry.rank === 3
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'text-neutral-400 bg-neutral-50 border-neutral-200';

          return (
            <div
              key={entry.rank}
              className={`flex items-center justify-between py-2.5 px-1.5 rounded-lg transition-colors ${
                entry.isCurrentUser ? 'bg-red-50/60 font-semibold' : 'hover:bg-neutral-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${rankBadgeColor}`}
                >
                  {entry.rank}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-900">
                    {entry.userName}
                    {entry.isCurrentUser && ' (Tú)'}
                  </span>
                  <span className="text-[10px] text-neutral-400 tabular-nums">
                    {entry.exactScoresCount} plenos · {entry.outcomesCount} aciertos
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className={`text-sm font-black tabular-nums ${isTop3 ? 'text-[#e2001a]' : 'text-neutral-800'}`}>
                  {entry.totalPoints}
                </span>
                <span className="text-[10px] font-semibold text-neutral-400">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
