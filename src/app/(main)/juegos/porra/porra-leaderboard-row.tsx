// Client: Fila individual de la clasificación de La Porra
'use client';

import React from 'react';
import type { PorraLeaderboardEntry } from '@/lib/porra/types';

interface PorraLeaderboardRowProps {
  readonly entry: PorraLeaderboardEntry;
  readonly showPick: boolean;
  readonly canRevealPredictions: boolean;
}

export function PorraLeaderboardRow({
  entry,
  showPick,
  canRevealPredictions,
}: PorraLeaderboardRowProps) {
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
      className={`flex items-center justify-between gap-2 py-2.5 px-2 rounded-xl transition-colors ${
        entry.isCurrentUser ? 'bg-red-50/60' : 'hover:bg-neutral-50/60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${rankBadgeColor}`}
        >
          {entry.rank}
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-900 truncate">
              {entry.userName}
              {entry.isCurrentUser && ' (Tú)'}
            </span>
            {showPick && entry.currentPrediction && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-neutral-700 tabular-nums">
                {canRevealPredictions || entry.isCurrentUser
                  ? `${entry.currentPrediction.homeScore} - ${entry.currentPrediction.awayScore}${
                      entry.currentPrediction.sportingScorers.length > 0
                        ? ` · ${entry.currentPrediction.sportingScorers[0]}`
                        : ''
                    }`
                  : 'Pronóstico sellado'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-500 tabular-nums">
            {entry.exactScoresCount} plenos · {entry.outcomesCount} aciertos
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {entry.lastMatchPoints !== undefined && entry.lastMatchPoints > 0 && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-700 tabular-nums">
            +{entry.lastMatchPoints} últ. J.
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span
            className={`text-sm font-black tabular-nums ${
              entry.rank <= 3 ? 'text-[#e2001a]' : 'text-neutral-800'
            }`}
          >
            {entry.totalPoints}
          </span>
          <span className="text-[10px] font-semibold text-neutral-400">pts</span>
        </div>
      </div>
    </div>
  );
}
