import type { Metadata } from "next";
import {
  getTopAppearancesPlayers,
  getTopScorersPlayers,
  getTopSeasonsPlayers,
  getIndividualAwards,
  getLegendProfiles,
  getTempleMilestones,
  getTopCoaches,
} from "@/lib/historical/legacy-service";
import { LegacyHub } from "./legacy-hub";

export const metadata: Metadata = {
  title: "Muro de Leyendas y El Molinón — Histórico — Mareona",
  description: "Récords históricos, leyendas rojiblancas y la memoria de El Molinón y Mareo.",
};

export default function HistoricoLegadoPage() {
  const topAppearances = getTopAppearancesPlayers(20);
  const topScorers = getTopScorersPlayers(20);
  const topSeasons = getTopSeasonsPlayers(20);
  const individualAwards = getIndividualAwards();
  const legends = getLegendProfiles();
  const templeMilestones = getTempleMilestones();
  const topCoaches = getTopCoaches(15);

  return (
    <div className="flex flex-col gap-6">
      <LegacyHub
        topAppearances={topAppearances}
        topScorers={topScorers}
        topSeasons={topSeasons}
        individualAwards={individualAwards}
        legends={legends}
        templeMilestones={templeMilestones}
        topCoaches={topCoaches}
      />
    </div>
  );
}
