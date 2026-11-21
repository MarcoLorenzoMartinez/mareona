// Client: Fila minimalista de la clasificación de La Porra
'use client';

import React from 'react';
import type { PorraLeaderboardEntry } from '@/lib/porra/types';
import { getDictionary } from '@/i18n';

interface PorraLeaderboardRowProps {
  readonly entry: PorraLeaderboardEntry;
}

export function PorraLeaderboardRow({ entry }: PorraLeaderboardRowProps) {
  const dict = getDictionary();
  const isUser = Boolean(entry.isCurrentUser);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
        isUser
          ? 'bg-[#e2001a]/[0.045] ring-1 ring-inset ring-[#e2001a]/20'
          : 'hover:bg-neutral-50/80'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-6 shrink-0 text-center font-sans text-xs font-bold tabular-nums ${
            isUser
              ? 'text-[#e2001a]'
              : entry.rank <= 3
                ? 'text-neutral-900'
                : 'text-neutral-400'
          }`}
        >
          {entry.rank}
        </span>

        <span
          className={`font-sans text-xs sm:text-sm truncate ${
            isUser ? 'font-bold text-[#e2001a]' : 'font-semibold text-neutral-900'
          }`}
        >
          {entry.userName}
        </span>
      </div>

      <div className="flex items-baseline gap-1 shrink-0">
        <span
          className={`font-sans text-sm font-black tabular-nums ${
            isUser || entry.rank <= 3 ? 'text-[#e2001a]' : 'text-neutral-800'
          }`}
        >
          {entry.totalPoints}
        </span>
        <span className="font-sans text-[11px] font-medium text-neutral-400">
          {dict.games.porra.leaderboard.ptsUnit}
        </span>
      </div>
    </div>
  );
}
