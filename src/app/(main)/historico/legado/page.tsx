import type { Metadata } from "next";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getTopCoaches,
} from "@/lib/historical/legacy-service";
import { LegacyRankingsView } from "./legacy-rankings-view";

export const metadata: Metadata = {
  title: "Récords y Palmarés — Histórico — Mareona",
  description: "Récords históricos y entrenadores del Real Sporting.",
};

export default function HistoricoLegadoPage() {
  const topAppearances = getTopAppearancesPlayers(100);
  const topScorers = getTopScorersPlayers(100);
  const topSeasons = getTopSeasonsPlayers(100);
  const topCoaches = getTopCoaches(100);

  return (
    <div className="flex flex-col gap-6">
      <LegacyRankingsView
        topAppearances={topAppearances}
        topScorers={topScorers}
        topSeasons={topSeasons}
        topCoaches={topCoaches}
      />
    </div>
  );
}
