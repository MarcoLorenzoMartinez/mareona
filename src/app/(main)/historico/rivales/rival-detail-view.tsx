// Client: Vista detallada del cara a cara con un rival (estadísticas, desglose y partidos)
"use client";

import { useState, useMemo } from "react";
import type { RivalH2HSummary, RivalScopeFilter } from "@/lib/historical/rivals-types";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import { RivalDetailHeader } from "./rival-detail-header";
import { RivalCompetitionPills } from "./rival-competition-pills";
import { RivalCompetitionTable } from "./rival-competition-table";
import { RivalMatchRow } from "./rival-match-row";

interface RivalDetailViewProps {
  readonly rival: RivalH2HSummary;
  readonly initialScope?: RivalScopeFilter;
  readonly onBack: () => void;
  readonly onSelectMatch: (match: DayMatchItem) => void;
}

/**
 * Editorial Head-to-Head profile for a selected rival.
 * Conforms to AGENTS.md rules 2, 3, 5, 8 and 9. Strictly <= 180 lines.
 */
export function RivalDetailView({
  rival,
  initialScope = "all",
  onBack,
  onSelectMatch,
}: RivalDetailViewProps) {
  const defaultComp = useMemo(() => {
    if (initialScope === "primera") {
      return rival.competitionsBreakdown.find((c) => c.competition.includes("1.ª"))?.competition ?? "all";
    }
    if (initialScope === "segunda") {
      return rival.competitionsBreakdown.find((c) => c.competition.includes("2.ª"))?.competition ?? "all";
    }
    if (initialScope === "copa") {
      return rival.competitionsBreakdown.find((c) => c.competition.includes("Copa") && !c.competition.includes("UEFA"))?.competition ?? "all";
    }
    if (initialScope === "uefa") {
      return rival.competitionsBreakdown.find((c) => c.competition.includes("UEFA"))?.competition ?? "all";
    }
    if (initialScope === "promocion") {
      return rival.competitionsBreakdown.find((c) => c.competition.includes("Promoción"))?.competition ?? "all";
    }
    return "all";
  }, [initialScope, rival.competitionsBreakdown]);

  const [selectedComp, setSelectedComp] = useState<string>(defaultComp);

  const sourceMatches = rival.allMatches && rival.allMatches.length > 0 ? rival.allMatches : rival.matches;

  const currentStats = useMemo(() => {
    if (selectedComp === "all") {
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      for (const m of sourceMatches) {
        if (m.outcome === "V") won++;
        else if (m.outcome === "E") drawn++;
        else if (m.outcome === "D") lost++;
        goalsFor += m.isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
        goalsAgainst += m.isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
      }
      return { played: sourceMatches.length, won, drawn, lost, goalsFor, goalsAgainst };
    }

    const compStat = rival.competitionsBreakdown.find((c) => c.competition === selectedComp);
    if (compStat) {
      return {
        played: compStat.played,
        won: compStat.won,
        drawn: compStat.drawn,
        lost: compStat.lost,
        goalsFor: compStat.goalsFor,
        goalsAgainst: compStat.goalsAgainst,
      };
    }

    const filtered = sourceMatches.filter((m) => m.competition === selectedComp);
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    for (const m of filtered) {
      if (m.outcome === "V") won++;
      else if (m.outcome === "E") drawn++;
      else if (m.outcome === "D") lost++;
      goalsFor += m.isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      goalsAgainst += m.isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
    }
    return { played: filtered.length, won, drawn, lost, goalsFor, goalsAgainst };
  }, [selectedComp, sourceMatches, rival.competitionsBreakdown]);

  const displayedMatches = useMemo(() => {
    if (selectedComp === "all") return sourceMatches;
    return sourceMatches.filter((m) => m.competition === selectedComp);
  }, [selectedComp, sourceMatches]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <nav aria-label="Navegación de retorno" className="-mt-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-md cursor-pointer"
          >
            ← Volver a rivales
          </button>
        </nav>

        <RivalDetailHeader
          rival={rival}
          selectedComp={selectedComp}
          currentStats={currentStats}
        />
      </div>

      <section aria-label="Desglose por competición" className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
          Balance por Competición
        </h3>
        <RivalCompetitionTable
          stats={rival.competitionsBreakdown}
          activeCompetition={selectedComp}
          onSelectCompetition={(comp) => setSelectedComp(comp === selectedComp ? "all" : comp)}
        />
      </section>

      <section aria-label="Historial cronológico de partidos" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              Partidos
            </h3>
            <span className="text-xs text-[var(--muted-foreground)] tabular-nums font-medium">
              ({displayedMatches.length})
            </span>
          </div>

          <RivalCompetitionPills
            competitions={rival.competitionsBreakdown}
            allMatchesCount={sourceMatches.length}
            selectedComp={selectedComp}
            onSelectComp={setSelectedComp}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xs divide-y divide-[var(--border)]/70">
          {displayedMatches.map((match) => (
            <RivalMatchRow key={match.id} match={match} onSelect={onSelectMatch} />
          ))}
        </div>
      </section>
    </div>
  );
}
