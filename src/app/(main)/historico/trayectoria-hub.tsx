// Client: Maneja la selección interactiva de temporada con sincronización en tiempo real con el gráfico
"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { HistoricalSeason, HistoricalChartPoint } from "@/lib/historical/types";
import {
  getHistoricalSeasonDataAction,
  type HistoricalSeasonBundle,
} from "./season-data-action";
import { HistoricalEvolutionChart } from "./evolution-chart";
import { HistoricalSeasonSelector } from "./season-picker";
import { HistoricalStandingsTable } from "./standings-table";
import { HistoricalSeasonLeaders } from "./season-leaders";

const HistoricalSeasonCoaches = dynamic(() =>
  import("./season-coaches").then((m) => m.HistoricalSeasonCoaches)
);
const HistoricalSeasonSquadTable = dynamic(() =>
  import("./season-squad").then((m) => m.HistoricalSeasonSquadTable)
);
const HistoricalSeasonMatches = dynamic(() =>
  import("./season-matches").then((m) => m.HistoricalSeasonMatches)
);

interface TrayectoriaHubProps {
  readonly seasons: readonly HistoricalSeason[];
  readonly chartPoints: readonly HistoricalChartPoint[];
  readonly decades?: readonly { label: string; decadeStart: number }[];
  readonly initialSeasonId?: string;
  readonly initialSeasonData?: HistoricalSeasonBundle | null;
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
  initialSeasonData,
}: TrayectoriaHubProps) {
  // Deep links from social attachments: /historico?temporada=2014-15&vista=partidos
  const searchParams = useSearchParams();
  const requestedSeasonId = searchParams.get("temporada");
  const defaultId = initialSeasonId ?? seasons[0]?.id ?? "2024-25";
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    seasons.some((s) => s.id === requestedSeasonId)
      ? (requestedSeasonId as string)
      : defaultId
  );
  const [activeTab, setActiveTab] = useState<SeasonViewTab>(
    searchParams.get("vista") === "partidos" ? "partidos" : "clasificacion"
  );

  const [seasonBundles, setSeasonBundles] = useState<Record<string, HistoricalSeasonBundle>>(() =>
    initialSeasonData ? { [defaultId]: initialSeasonData } : {}
  );

  const selectedSeason = useMemo(() => {
    return seasons.find((s) => s.id === selectedSeasonId) ?? seasons[0]!;
  }, [seasons, selectedSeasonId]);

  useEffect(() => {
    if (seasonBundles[selectedSeason.id]) return;
    let active = true;
    void getHistoricalSeasonDataAction(selectedSeason.id).then((bundle) => {
      if (active && bundle) {
        setSeasonBundles((prev) => ({ ...prev, [selectedSeason.id]: bundle }));
      }
    });
    return () => {
      active = false;
    };
  }, [selectedSeason.id, seasonBundles]);

  const activeBundle = seasonBundles[selectedSeason.id];
  const standingsRows = activeBundle?.standings ?? [];
  const squad = activeBundle?.squad ?? null;
  const assists = activeBundle?.assists ?? [];
  const matches = activeBundle?.matches ?? [];

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
      <div className="flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Secciones de la temporada"
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[38px] items-center justify-center rounded-full px-5 py-1.5 text-xs sm:text-sm transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
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
