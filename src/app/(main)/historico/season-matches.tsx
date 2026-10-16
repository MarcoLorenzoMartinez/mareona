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
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar por competición">
          {competitions.map((comp) => (
            <button
              key={comp}
              type="button"
              role="tab"
              aria-selected={compFilter === comp}
              onClick={() => setCompFilter(comp)}
              className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                compFilter === comp
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
              }`}
            >
              {comp === "all" ? "Todas" : comp}
            </button>
          ))}
        </div>

        {/* Venue (Casa / Fuera) */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Filtrar por sede">
          {VENUE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={venueFilter === item.id}
              onClick={() => setVenueFilter(item.id)}
              className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                venueFilter === item.id
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
              }`}
            >
              {item.label}
            </button>
          ))}
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

