import type { Metadata } from "next";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getTopCoaches,
  getIndividualAwards,
} from "@/lib/historical/legacy-service";
import { LegacyRankingsView } from "./legacy-rankings-view";

export const metadata: Metadata = {
  title: "Récords y Palmarés — Histórico — Mareona",
  description: "Récords históricos, palmarés individual y entrenadores del Real Sporting.",
};

export default function HistoricoLegadoPage() {
  const topAppearances = getTopAppearancesPlayers(20);
  const topScorers = getTopScorersPlayers(20);
  const topSeasons = getTopSeasonsPlayers(20);
  const topCoaches = getTopCoaches(20);
  const individualAwards = getIndividualAwards();

  return (
    <div className="flex flex-col gap-6">
      <LegacyRankingsView
        topAppearances={topAppearances}
        topScorers={topScorers}
        topSeasons={topSeasons}
        topCoaches={topCoaches}
        individualAwards={individualAwards}
      />
    </div>
  );
}
