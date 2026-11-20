// Client: Lista interactiva de partidos con diseño de trayectoria y apertura de acta oficial
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();

  if (matches.length === 0) return null;

  const partidoParam = searchParams.get("partido");
  const activeMatch =
    selectedMatch ?? (partidoParam ? matches.find((m) => m.id === partidoParam) ?? null : null);

  const handleCloseModal = () => {
    setSelectedMatch(null);
    if (partidoParam) {
      router.replace("/historico/efemerides", { scroll: false });
    }
  };

  const matchForModal: HistoricalMatch | null = activeMatch
    ? {
        id: activeMatch.id,
        date: activeMatch.date,
        competition: activeMatch.competition,
        round: activeMatch.round,
        homeTeam: activeMatch.homeTeam,
        homeCrestUrl: activeMatch.homeCrestUrl,
        awayTeam: activeMatch.awayTeam,
        awayCrestUrl: activeMatch.awayCrestUrl,
        homeScore: activeMatch.homeScore,
        awayScore: activeMatch.awayScore,
        isHome: activeMatch.isHome,
        outcome: activeMatch.outcome,
        opponent: activeMatch.opponent,
        venue: activeMatch.venue,
        bdfMatchId: activeMatch.bdfMatchId,
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
      {matchForModal && activeMatch && (
        <HistoricalMatchDetailModal
          match={matchForModal}
          season={activeMatch.season}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
