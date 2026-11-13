import type { ReactElement } from "react";

export interface H2HMetricsLabels {
  readonly played?: string;
  readonly won?: string;
  readonly drawn?: string;
  readonly lost?: string;
  readonly goals?: string;
}

export interface H2HMetricsStripProps {
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  /** Highlights the won count in primary sporting red (#e2001a). */
  readonly highlightWon?: boolean;
  /** Custom desktop labels. Mobile always uses compact PJ, V, E, D codes for optimal ergonomics. */
  readonly labels?: H2HMetricsLabels;
  readonly className?: string;
}

/**
 * Editorial Head-to-Head and regional metrics summary strip.
 * Features a streamlined 4-column row (PJ | V | E | D) on mobile with goals below,
 * transitioning to 5 equal columns on desktop (>= sm).
 * Adheres strictly to AGENTS.md: <= 180 lines, font-sans tabular-nums.
 */
export function H2HMetricsStrip({
  played,
  won,
  drawn,
  lost,
  goalsFor,
  goalsAgainst,
  highlightWon = false,
  labels,
  className = "",
}: H2HMetricsStripProps): ReactElement {
  const desktopLabels = {
    played: labels?.played ?? "Partidos",
    won: labels?.won ?? "Victorias",
    drawn: labels?.drawn ?? "Empates",
    lost: labels?.lost ?? "Derrotas",
    goals: labels?.goals ?? "Goles",
  };

  const wonColor = highlightWon ? "text-[var(--primary)]" : "text-neutral-900";

  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-neutral-50/50 text-center ${className}`.trim()}
    >
      {/* Mobile view (< sm): 4 columns in 1 single row (PJ, V, E, D) + centered goals row */}
      <div className="sm:hidden">
        <div className="grid grid-cols-4 divide-x divide-[var(--border)] py-2.5">
          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              PJ
            </span>
            <span className="mt-0.5 text-xl font-black font-sans tabular-nums text-neutral-900">
              {played}
            </span>
          </div>

          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              V
            </span>
            <span className={`mt-0.5 text-xl font-black font-sans tabular-nums ${wonColor}`}>
              {won}
            </span>
          </div>

          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              E
            </span>
            <span className="mt-0.5 text-xl font-black font-sans tabular-nums text-neutral-900">
              {drawn}
            </span>
          </div>

          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              D
            </span>
            <span className="mt-0.5 text-xl font-black font-sans tabular-nums text-neutral-700">
              {lost}
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--border)] py-2 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {labels?.goals ?? "Goles"}
          </span>
          <span className="mt-0.5 text-lg font-black font-sans tabular-nums text-neutral-900">
            {goalsFor} : {goalsAgainst}
          </span>
        </div>
      </div>

      {/* Desktop view (>= sm): 5 columns in 1 continuous horizontal row */}
      <div className="hidden sm:grid sm:grid-cols-5 divide-x divide-[var(--border)] py-3">
        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {desktopLabels.played}
          </span>
          <span className="mt-0.5 text-2xl font-black font-sans tabular-nums sm:text-3xl text-neutral-900">
            {played}
          </span>
        </div>

        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {desktopLabels.won}
          </span>
          <span className={`mt-0.5 text-2xl font-black font-sans tabular-nums sm:text-3xl ${wonColor}`}>
            {won}
          </span>
        </div>

        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {desktopLabels.drawn}
          </span>
          <span className="mt-0.5 text-2xl font-black font-sans tabular-nums sm:text-3xl text-neutral-900">
            {drawn}
          </span>
        </div>

        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {desktopLabels.lost}
          </span>
          <span className="mt-0.5 text-2xl font-black font-sans tabular-nums sm:text-3xl text-neutral-700">
            {lost}
          </span>
        </div>

        <div className="flex flex-col items-center px-2 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {desktopLabels.goals}
          </span>
          <span className="mt-0.5 text-2xl font-black font-sans tabular-nums sm:text-3xl text-neutral-900">
            {goalsFor} : {goalsAgainst}
          </span>
        </div>
      </div>
    </div>
  );
}
