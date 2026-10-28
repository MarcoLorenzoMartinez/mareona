// Client: Cabecera y métricas principales del detalle de un rival histórico
"use client";

import type { RivalH2HSummary } from "@/lib/historical/rivals-types";
import { TeamCrest } from "@/components/media/team-crest";

import { formatRivalLocation } from "@/lib/historical/rival-location";

interface RivalDetailHeaderProps {
  readonly rival: RivalH2HSummary;
  readonly selectedComp: string;
  readonly currentStats: {
    readonly played: number;
    readonly won: number;
    readonly drawn: number;
    readonly lost: number;
    readonly goalsFor: number;
    readonly goalsAgainst: number;
  };
}

/**
 * Editorial top card for rival detail with crest, and key H2H metric numbers.
 * Adheres to AGENTS.md rule 5: strictly <= 180 lines, font-sans tabular-nums.
 */
export function RivalDetailHeader({
  rival,
  selectedComp,
  currentStats,
}: RivalDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
      <div className="flex items-center gap-4">
        <TeamCrest crestUrl={rival.crestUrl} teamName={rival.name} size="lg" isSporting={false} />
        <div className="flex flex-col min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl truncate">
            {rival.name}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-[var(--foreground-muted)] flex-wrap">
            <span className="font-medium text-[var(--foreground-muted)]">
              {formatRivalLocation(rival)}
            </span>
            {selectedComp !== "all" && (
              <>
                <span aria-hidden="true" className="text-neutral-300">
                  ·
                </span>
                <span className="font-semibold text-[var(--primary)]">
                  Balance en {selectedComp}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Big Metrics Strip: Monocromía Editorial con números tabulares */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-neutral-50/40 py-3 text-center">
        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Partidos</span>
          <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
            {currentStats.played}
          </span>
        </div>
        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Victorias</span>
          <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
            {currentStats.won}
          </span>
        </div>
        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Empates</span>
          <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
            {currentStats.drawn}
          </span>
        </div>
        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Derrotas</span>
          <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
            {currentStats.lost}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Goles</span>
          <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
            {currentStats.goalsFor} : {currentStats.goalsAgainst}
          </span>
        </div>
      </div>
    </div>
  );
}
