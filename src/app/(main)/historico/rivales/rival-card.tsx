// Client: Tarjeta individual de rival para la cuadrícula alfabética
"use client";

import type { RivalH2HSummary } from "@/lib/historical/rivals-types";
import { TeamCrest } from "@/components/media/team-crest";

interface RivalCardProps {
  readonly rival: RivalH2HSummary;
  readonly onSelect: (rival: RivalH2HSummary) => void;
}

/**
 * Editorial card for an individual rival in the alphabetical grid.
 * Displays crest, canonical name, geographic tag, match count and W-D-L summary.
 */
export function RivalCard({ rival, onSelect }: RivalCardProps) {
  const isPositive = rival.won >= rival.lost;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(rival)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(rival);
        }
      }}
      aria-label={`Ver historial completo contra ${rival.name}: ${rival.played} partidos disputados`}
      className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs transition-all hover:border-[var(--primary)] hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
    >
      {/* Top Header: Crest, Name and Geographic Badge */}
      <div className="flex items-start gap-3">
        <TeamCrest
          crestUrl={rival.crestUrl}
          teamName={rival.name}
          size="md"
          isSporting={false}
        />

        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
            {rival.name}
          </h3>
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] truncate">
            {rival.isInternational ? rival.country : `${rival.province} (${rival.community})`}
          </span>
        </div>
      </div>

      {/* Bottom Metrics: Matches and W-D-L Balance Strip */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[var(--border)]/70 pt-2.5">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-black text-neutral-900 font-sans tabular-nums">
            {rival.played}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {rival.played === 1 ? "partido" : "partidos"}
          </span>
        </div>

        {/* W-D-L capsules */}
        <div className="flex items-center gap-1 text-[11px] font-bold font-sans tabular-nums">
          <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-900" title="Victorias">
            {rival.won}V
          </span>
          <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-600" title="Empates">
            {rival.drawn}E
          </span>
          <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-600" title="Derrotas">
            {rival.lost}D
          </span>
          <span
            className={`ml-1 text-[10px] font-bold ${
              isPositive ? "text-emerald-700" : "text-neutral-500"
            }`}
          >
            {rival.goalsFor}:{rival.goalsAgainst}
          </span>
        </div>
      </div>
    </article>
  );
}
