import type { Metadata } from "next";
import {
  getAllRivalsSummaries,
  getSummariesByCommunity,
  getSummariesByCountry,
} from "@/lib/historical/rivals-service";
import { RivalsHub } from "./rivals-hub";

export const metadata: Metadata = {
  title: "Historial Cara a Cara (H2H) — Histórico — Mareona",
  description: "Buscador y balance histórico del Real Sporting frente a todos sus rivales oficiales por comunidad y país.",
};

export default function HistoricoRivalesPage() {
  const allRivals = getAllRivalsSummaries();
  const communitySummaries = getSummariesByCommunity(allRivals);
  const countrySummaries = getSummariesByCountry(allRivals);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Historial Cara a Cara
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Balance histórico, victorias y goles contra los {allRivals.length} rivales oficiales del Real Sporting.
        </p>
      </header>

      <RivalsHub
        allRivals={allRivals}
        communitySummaries={communitySummaries}
        countrySummaries={countrySummaries}
      />
    </div>
  );
}
