import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/i18n';

interface PorraHeaderProps {
  readonly onOpenRewards: () => void;
}

export function PorraHeader({ onOpenRewards }: PorraHeaderProps) {
  const dict = getDictionary();
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] pb-3">
      <div className="flex items-center gap-3">
        <Link
          href="/juegos"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
          aria-label={dict.games.porra.header.backAria}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            {dict.games.porra.header.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenRewards}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 font-sans text-xs font-bold text-[var(--foreground)] shadow-2xs transition-colors hover:border-[#e2001a] hover:text-[#e2001a] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
        >
          <span>{dict.games.porra.header.rewardsButton}</span>
        </button>
      </div>
    </header>
  );
}
