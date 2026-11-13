// Client: Cabecera y métricas principales del detalle de un rival histórico
"use client";

import type { RivalH2HSummary } from "@/lib/historical/rivals-types";
import { TeamCrest } from "@/components/media/team-crest";
import { formatRivalLocation } from "@/lib/historical/rival-location";
import { H2HMetricsStrip } from "@/components/sports/h2h-metrics-strip";

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
      <H2HMetricsStrip
        played={currentStats.played}
        won={currentStats.won}
        drawn={currentStats.drawn}
        lost={currentStats.lost}
        goalsFor={currentStats.goalsFor}
        goalsAgainst={currentStats.goalsAgainst}
      />
    </div>
  );
}
