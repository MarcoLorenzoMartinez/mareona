// Client: Selector táctil del tanteo de un equipo en La Porra
'use client';

import React from 'react';
import { TeamCrest } from '@/components/media/team-crest';

interface PorraScoreCounterProps {
  readonly teamName: string;
  readonly crestUrl?: string;
  readonly isSporting: boolean;
  readonly score: number;
  readonly isLocked: boolean;
  readonly onScoreChange: (delta: number) => void;
  readonly minusLabel: string;
  readonly plusLabel: string;
}

export function PorraScoreCounter({
  teamName,
  crestUrl,
  isSporting,
  score,
  isLocked,
  onScoreChange,
  minusLabel,
  plusLabel,
}: PorraScoreCounterProps) {
  const stepBtnClass =
    'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-base font-bold text-neutral-800 hover:bg-neutral-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer';

  return (
    <div className="flex flex-col items-center gap-2">
      <TeamCrest
        crestUrl={crestUrl}
        teamName={teamName}
        isSporting={isSporting}
        size="md"
      />
      <span className="text-center text-xs font-bold text-neutral-900 line-clamp-1">
        {teamName}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onScoreChange(-1)}
          className={stepBtnClass}
          aria-label={minusLabel}
        >
          -
        </button>
        <span className="w-8 text-center text-2xl font-black tabular-nums text-neutral-900">
          {score}
        </span>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onScoreChange(1)}
          className={stepBtnClass}
          aria-label={plusLabel}
        >
          +
        </button>
      </div>
    </div>
  );
}
