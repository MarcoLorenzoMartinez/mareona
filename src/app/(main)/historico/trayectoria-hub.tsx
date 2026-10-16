// Client: Maneja la selección interactiva de temporada con sincronización en tiempo real con el gráfico
"use client";

import { useState, useMemo } from "react";
import type { HistoricalSeason, HistoricalChartPoint } from "@/lib/historical/types";
import { getStandings, getSquadForSeason, getAssistsForSeason, getMatchesForSeason } from "@/lib/historical/service";
import { HistoricalEvolutionChart } from "./evolution-chart";
import { HistoricalSeasonSelector } from "./season-picker";
import { HistoricalStandingsTable } from "./standings-table";
import { HistoricalSeasonLeaders } from "./season-leaders";
import { HistoricalSeasonCoaches } from "./season-coaches";
import { HistoricalSeasonSquadTable } from "./season-squad";
import { HistoricalSeasonMatches } from "./season-matches";

interface TrayectoriaHubProps {
  readonly seasons: readonly HistoricalSeason[];
  readonly chartPoints: readonly HistoricalChartPoint[];
  readonly decades?: readonly { label: string; decadeStart: number }[];
  readonly initialSeasonId?: string;
}

type SeasonViewTab = "clasificacion" | "partidos" | "plantilla";

const TABS: readonly { readonly id: SeasonViewTab; readonly label: string }[] = [
  { id: "clasificacion", label: "Clasificación" },
  { id: "partidos", label: "Partidos" },
  { id: "plantilla", label: "Plantilla" },
];

/**
 * Interactive hub coordinating trajectory chart, season selector,
 * official standings table, match results calendar, and club squad dossier for Real Sporting.
 */
export function HistoricalTrayectoriaHub({
  seasons,
  chartPoints,
  initialSeasonId,
}: TrayectoriaHubProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    initialSeasonId ?? seasons[0]?.id ?? "2024-25"
  );
  const [activeTab, setActiveTab] = useState<SeasonViewTab>("clasificacion");

  const selectedSeason = useMemo(() => {
    return seasons.find((s) => s.id === selectedSeasonId) ?? seasons[0]!;
  }, [seasons, selectedSeasonId]);

  const standingsRows = useMemo(() => {
    return getStandings(selectedSeason);
  }, [selectedSeason]);

  const squad = useMemo(() => {
    return getSquadForSeason(selectedSeason.id);
  }, [selectedSeason.id]);

  const assists = useMemo(() => {
    return getAssistsForSeason(selectedSeason.id);
  }, [selectedSeason.id]);

  const matches = useMemo(() => {
    return getMatchesForSeason(selectedSeason.id);
  }, [selectedSeason.id]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Interactive Trajectory Evolution Chart */}
      <HistoricalEvolutionChart
        points={chartPoints}
        selectedSeasonId={selectedSeasonId}
        onSelectSeason={setSelectedSeasonId}
      />

      {/* 2. Step-by-Step Season Selector underneath the chart */}
      <HistoricalSeasonSelector
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSelectSeason={setSelectedSeasonId}
      />

      {/* 3. Segmented Control Tabs (Clasificación / Partidos / Plantilla) */}
      <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Secciones de la temporada">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2 text-sm cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white font-bold shadow-xs"
                : "bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--border)] font-medium"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Active Tab Content */}
      {activeTab === "clasificacion" && (
        <div className="flex flex-col gap-6">
          <HistoricalStandingsTable rows={standingsRows} season={selectedSeason} />
          {squad && (
            <HistoricalSeasonLeaders
              topScorers={squad.topScorers}
              assists={assists}
              players={squad.players}
              seasonLabel={selectedSeason.label}
            />
          )}
        </div>
      )}

      {activeTab === "partidos" && (
        <HistoricalSeasonMatches matches={matches} seasonLabel={selectedSeason.label} />
      )}

      {activeTab === "plantilla" && squad && (
        <div className="flex flex-col gap-6">
          <HistoricalSeasonCoaches coaches={squad.coaches} seasonLabel={selectedSeason.label} />
          <HistoricalSeasonSquadTable
            players={squad.players}
            seasonLabel={selectedSeason.label}
          />
        </div>
      )}
    </div>
  );
}
