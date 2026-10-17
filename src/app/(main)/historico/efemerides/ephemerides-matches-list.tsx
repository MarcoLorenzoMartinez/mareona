// Client: Lista interactiva de partidos con diseño de trayectoria y apertura de acta oficial
"use client";

import { useState } from "react";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import type { HistoricalMatch } from "@/lib/historical/types";
import { EphemeridesMatchRow } from "./ephemerides-match-row";
import { HistoricalMatchDetailModal } from "../match-detail-modal";

interface EphemeridesMatchesListProps {
  readonly matches: readonly DayMatchItem[];
}

/**
 * Renders official historical matches using the Trayectoria layout,
 * featuring date context on the left, centered score badge, team crests, and outcome pill.
 */
export function EphemeridesMatchesList({ matches }: EphemeridesMatchesListProps) {
  const [selectedMatch, setSelectedMatch] = useState<DayMatchItem | null>(null);

  if (matches.length === 0) return null;

  const matchForModal: HistoricalMatch | null = selectedMatch
    ? {
        id: selectedMatch.id,
        date: selectedMatch.date,
        competition: selectedMatch.competition,
        round: selectedMatch.round,
        homeTeam: selectedMatch.homeTeam,
        homeCrestUrl: selectedMatch.homeCrestUrl,
        awayTeam: selectedMatch.awayTeam,
        awayCrestUrl: selectedMatch.awayCrestUrl,
        homeScore: selectedMatch.homeScore,
        awayScore: selectedMatch.awayScore,
        isHome: selectedMatch.isHome,
        outcome: selectedMatch.outcome,
        opponent: selectedMatch.opponent,
        venue: selectedMatch.venue,
        bdfMatchId: selectedMatch.bdfMatchId,
      }
    : null;

  return (
    <section aria-label="Partidos oficiales disputados en esta fecha" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
        Partidos
      </h3>

      <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white shadow-2xs overflow-hidden">
        {matches.map((m) => (
          <EphemeridesMatchRow key={m.id} match={m} onSelect={setSelectedMatch} />
        ))}
      </div>

      {/* Official Match Sheet Modal */}
      {matchForModal && selectedMatch && (
        <HistoricalMatchDetailModal
          match={matchForModal}
          season={selectedMatch.season}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </section>
  );
}
