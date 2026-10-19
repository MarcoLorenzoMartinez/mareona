import type { Metadata } from "next";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getTopCoaches,
  getIndividualAwards,
  getLegendProfiles,
} from "@/lib/historical/legacy-service";
import { LegacyHub } from "./legacy-hub";

export const metadata: Metadata = {
  title: "Récords y Leyendas — Histórico — Mareona",
  description: "Récords históricos, palmarés y muro de leyendas rojiblancas.",
};

export default function HistoricoLegadoPage() {
  const topAppearances = getTopAppearancesPlayers(20);
  const topScorers = getTopScorersPlayers(20);
  const topSeasons = getTopSeasonsPlayers(20);
  const topCoaches = getTopCoaches(20);
  const individualAwards = getIndividualAwards();
  const legends = getLegendProfiles();

  return (
    <div className="flex flex-col gap-6">
      <LegacyHub
        topAppearances={topAppearances}
        topScorers={topScorers}
        topSeasons={topSeasons}
        topCoaches={topCoaches}
        individualAwards={individualAwards}
        legends={legends}
      />
    </div>
  );
}


