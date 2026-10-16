import type { Metadata } from "next";
import {
  getAllSeasons,
  getHistoricalChartPoints,
} from "@/lib/historical/service";
import { HistoricalTrayectoriaHub } from "./trayectoria-hub";

export const metadata: Metadata = {
  title: "Trayectoria y Temporadas — Histórico — Mareona",
  description: "Evolución histórica del Real Sporting en la Liga y archivo completo de temporadas con clasificaciones y escudos.",
};

export default function HistoricoTrayectoriaPage() {
  const seasons = getAllSeasons();
  const chartPoints = getHistoricalChartPoints();
  const defaultSeasonId = seasons[0]?.id;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Trayectoria y Temporadas</h1>

      <HistoricalTrayectoriaHub
        seasons={seasons}
        chartPoints={chartPoints}
        initialSeasonId={defaultSeasonId}
      />
    </div>
  );
}
