// Client: Filtros interactivos de partidos por competición y condición de campo
"use client";

import { useState, useMemo } from "react";
import type { HistoricalMatch } from "@/lib/historical/types";
import { HistoricalMatchRow } from "./match-row";
import { HistoricalMatchDetailModal } from "./match-detail-modal";

interface SeasonMatchesProps {
  readonly matches: readonly HistoricalMatch[];
  readonly seasonLabel: string;
}

type VenueFilter = "all" | "home" | "away";

const VENUE_OPTIONS: readonly { readonly id: VenueFilter; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "home", label: "Casa" },
  { id: "away", label: "Fuera" },
];

/**
 * Interactive match calendar for a historical season with competition and venue filters,
 * compact matchday cards, team crests, and sports outcome pills.
 */
export function HistoricalSeasonMatches({ matches, seasonLabel }: SeasonMatchesProps) {
  const [compFilter, setCompFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");
  const [selectedMatch, setSelectedMatch] = useState<HistoricalMatch | null>(null);

  const competitions = useMemo(() => {
    return ["all", ...new Set(matches.map((m) => m.competition))];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (compFilter !== "all" && m.competition !== compFilter) return false;
      if (venueFilter === "home" && !m.isHome) return false;
      if (venueFilter === "away" && m.isHome) return false;
      return true;
    });
  }, [matches, compFilter, venueFilter]);

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--foreground-muted)]">
        No se dispone de actas de partidos registradas para la temporada {seasonLabel}.
      </div>
    );
  }

  return (
    <section aria-label={`Partidos oficiales del Real Sporting ${seasonLabel}`} className="w-full rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        {/* Competitions */}
        <div
          role="tablist"
          aria-label="Filtrar por competición"
          className="inline-flex flex-wrap items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 self-start sm:self-auto"
        >
          {competitions.map((comp) => {
            const isSelected = compFilter === comp;
            return (
              <button
                key={comp}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setCompFilter(comp)}
                className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {comp === "all" ? "Todas" : comp}
              </button>
            );
          })}
        </div>

        {/* Venue (Casa / Fuera) */}
        <div
          role="tablist"
          aria-label="Filtrar por sede"
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 self-start sm:self-auto"
        >
          {VENUE_OPTIONS.map((item) => {
            const isSelected = venueFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setVenueFilter(item.id)}
                className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match List */}
      <div className="divide-y divide-[var(--border)] mt-1">
        {filteredMatches.map((m) => (
          <HistoricalMatchRow key={m.id} match={m} onSelect={setSelectedMatch} />
        ))}
      </div>

      {/* Official Match Sheet Modal */}
      {selectedMatch && (
        <HistoricalMatchDetailModal
          match={selectedMatch}
          season={seasonLabel}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </section>
  );
}

