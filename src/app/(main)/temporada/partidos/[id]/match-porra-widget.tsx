// Client: Widget contextual sutil de La Porra en la previa del partido
'use client';

import React from 'react';
import Link from 'next/link';
import { isPorraSubmissionOpen } from '@/lib/porra/engine';

interface MatchPorraWidgetProps {
  matchId: string;
  kickoffAt: string;
  status: string;
}

export function MatchPorraWidget({
  kickoffAt,
  status,
}: MatchPorraWidgetProps) {
  const isOpen = isPorraSubmissionOpen(kickoffAt, status);
  if (!isOpen) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-2xs">
      <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
        La Porra de la Mareona
      </span>

      <Link
        href="/juegos/porra"
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#b30015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] focus-visible:ring-offset-2 active:scale-95"
      >
        Hacer pronóstico
      </Link>
    </div>
  );
}

