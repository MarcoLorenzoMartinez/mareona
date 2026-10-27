import React from 'react';
import Link from 'next/link';

export function PorraHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] pb-3">
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
            La Porra de la Mareona
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#e2001a] px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
          Jornada
        </span>
      </div>
    </header>
  );
}
