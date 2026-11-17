// Client: Selector de competiciones en formato píldora para el detalle de un rival
"use client";

import type { CompetitionStats } from "@/lib/historical/rivals-types";

interface RivalCompetitionPillsProps {
  readonly competitions: readonly CompetitionStats[];
  readonly allMatchesCount: number;
  readonly selectedComp: string;
  readonly onSelectComp: (comp: string) => void;
}

/**
 * Pill-based segmented selector for competition filtering in rival detail view.
 * Conforms to AGENTS.md rule 9 (pill aesthetics, red active state, pure white text).
 */
export function RivalCompetitionPills({
  competitions,
  allMatchesCount,
  selectedComp,
  onSelectComp,
}: RivalCompetitionPillsProps) {
  if (competitions.length <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Filtrar por competición"
      className="inline-flex flex-wrap items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 self-start"
    >
      <button
        type="button"
        role="tab"
        aria-selected={selectedComp === "all"}
        onClick={() => onSelectComp("all")}
        className={`inline-flex min-h-[34px] items-center justify-center gap-1 rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
          selectedComp === "all"
            ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
            : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
        }`}
      >
        <span>Todas</span>
        <span className="tabular-nums opacity-90">({allMatchesCount})</span>
      </button>
      {competitions.map((c) => {
        const isSelected = selectedComp === c.competition;
        return (
          <button
            key={c.competition}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectComp(c.competition)}
            className={`inline-flex min-h-[34px] items-center justify-center gap-1 rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              isSelected
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            <span>{c.competition}</span>
            <span className="tabular-nums opacity-90">({c.played})</span>
          </button>
        );
      })}
    </div>
  );
}
