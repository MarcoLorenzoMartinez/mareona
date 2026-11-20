// Client: Pagination controls for La Porra leaderboard
'use client';

import { getDictionary } from '@/i18n';

interface PorraLeaderboardPaginationProps {
  readonly safePage: number;
  readonly totalPages: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

export function PorraLeaderboardPagination({
  safePage,
  totalPages,
  onPrev,
  onNext,
}: PorraLeaderboardPaginationProps) {
  const dict = getDictionary();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={safePage <= 1}
        className="min-h-8 rounded-full border border-[var(--border)] bg-white px-3.5 py-1 text-xs font-bold text-neutral-700 transition-colors hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        {dict.games.porra.leaderboard.prevPage}
      </button>
      <span className="font-sans text-xs font-semibold tabular-nums text-neutral-500">
        {dict.games.porra.leaderboard.pagePrefix} {safePage} {dict.games.porra.leaderboard.pageOf} {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={safePage >= totalPages}
        className="min-h-8 rounded-full border border-[var(--border)] bg-white px-3.5 py-1 text-xs font-bold text-neutral-700 transition-colors hover:bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        {dict.games.porra.leaderboard.nextPage}
      </button>
    </div>
  );
}
