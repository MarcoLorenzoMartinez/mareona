import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAllSeasons,
  getHistoricalChartPoints,
  getStandings,
  getSquadForSeason,
  getAssistsForSeason,
  getMatchesForSeason,
} from "@/lib/historical/service";
import { HistoricalTrayectoriaHub } from "./trayectoria-hub";

export const metadata: Metadata = {
  title: "Histórico",
  description: "Evolución histórica del Real Sporting en la Liga y archivo completo de temporadas con clasificaciones y escudos.",
};

export default async function HistoricoTrayectoriaPage() {
  "use cache";
  cacheLife("days");
  const seasons = getAllSeasons();
  const chartPoints = getHistoricalChartPoints();
  const defaultSeason = seasons[0];
  const initialSeasonData = defaultSeason
    ? {
        standings: getStandings(defaultSeason),
        squad: getSquadForSeason(defaultSeason.id),
        assists: getAssistsForSeason(defaultSeason.id),
        matches: getMatchesForSeason(defaultSeason.id),
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Trayectoria y Temporadas</h1>

      <Suspense fallback={null}>
        <HistoricalTrayectoriaHub
          seasons={seasons}
          chartPoints={chartPoints}
          initialSeasonId={defaultSeason?.id}
          initialSeasonData={initialSeasonData}
        />
      </Suspense>
    </div>
  );
}
