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
    <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar por competición">
      <button
        type="button"
        role="tab"
        aria-selected={selectedComp === "all"}
        onClick={() => onSelectComp("all")}
        className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
          selectedComp === "all"
            ? "bg-[var(--primary)] text-white shadow-2xs"
            : "bg-white border border-[var(--border)] text-neutral-700 hover:border-neutral-400"
        }`}
      >
        Todas ({allMatchesCount})
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
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              isSelected
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "bg-white border border-[var(--border)] text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {c.competition} ({c.played})
          </button>
        );
      })}
    </div>
  );
}
