import type { Metadata } from "next";
import {
  getAllRivalsSummaries,
  getSummariesByCommunity,
  getSummariesByCountry,
} from "@/lib/historical/rivals-service";
import { RivalsHub } from "./rivals-hub";

export const metadata: Metadata = {
  title: "Historial Cara a Cara",
  description: "Buscador y balance histórico del Real Sporting frente a todos sus rivales oficiales por comunidad y país.",
};

export default function HistoricoRivalesPage() {
  const allRivals = getAllRivalsSummaries();
  const communitySummaries = getSummariesByCommunity(allRivals);
  const countrySummaries = getSummariesByCountry(allRivals);

  return (
    <div className="flex flex-col gap-6">
      <RivalsHub
        allRivals={allRivals}
        communitySummaries={communitySummaries}
        countrySummaries={countrySummaries}
      />
    </div>
  );
}
