// Client: Maneja la selección interactiva de temporada con sincronización en tiempo real con el gráfico
"use client";

import { useState, useMemo } from "react";
import type { HistoricalSeason, HistoricalChartPoint } from "@/lib/historical/types";
import { getStandings, getSquadForSeason, getAssistsForSeason } from "@/lib/historical/service";
import { HistoricalEvolutionChart } from "./evolution-chart";
import { HistoricalSeasonSelector } from "./season-picker";
import { HistoricalStandingsTable } from "./standings-table";
import { HistoricalSeasonLeaders } from "./season-leaders";
import { HistoricalSeasonSquadTable } from "./season-squad";

interface TrayectoriaHubProps {
  readonly seasons: readonly HistoricalSeason[];
  readonly chartPoints: readonly HistoricalChartPoint[];
  readonly decades?: readonly { label: string; decadeStart: number }[];
  readonly initialSeasonId?: string;
}

/**
 * Interactive hub coordinating trajectory chart, season selector,
 * official standings table, and club squad dossier for Real Sporting.
 */
export function HistoricalTrayectoriaHub({
  seasons,
  chartPoints,
  initialSeasonId = "1978-79",
}: TrayectoriaHubProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(initialSeasonId);

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

      {/* 3. Full Official Standings Table */}
      <HistoricalStandingsTable rows={standingsRows} season={selectedSeason} />

      {/* 4. Sporting Dossier: Coaches, Top Scorers, Assists / Appearances */}
      {squad && (
        <>
          <HistoricalSeasonLeaders
            coaches={squad.coaches}
            topScorers={squad.topScorers}
            assists={assists}
            players={squad.players}
            seasonLabel={selectedSeason.label}
          />

          {/* 5. Sporting Dossier: Official Squad with Tactical Filters */}
          <HistoricalSeasonSquadTable
            players={squad.players}
            seasonLabel={selectedSeason.label}
          />
        </>
      )}
    </div>
  );
}
