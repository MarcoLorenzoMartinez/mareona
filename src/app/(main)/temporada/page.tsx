import type { Metadata } from "next";
import { fetchStandings, fetchNextFixture } from "@/lib/sports-api/client";
import {
  getSeasonLabel,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "@/lib/sports-api/types";
import { NextFixtureHero } from "./next-fixture-hero";
import { SeasonSummaryTable } from "./season-summary-table";

export const metadata: Metadata = {
  title: "Temporada — Mareona",
  description: "Partidos, clasificación y actualidad del Real Sporting de Gijón.",
};

export default async function TemporadaPage() {
  "use cache";
  let standings: readonly DomainStandingRow[] = [];
  let match: DomainMatchSummary | null = null;

  try {
    const [standingsRes, matchRes] = await Promise.allSettled([
      fetchStandings(undefined, undefined, { includeSplits: false }),
      fetchNextFixture(),
    ]);

    if (standingsRes.status === "fulfilled" && standingsRes.value.length > 0) {
      standings = standingsRes.value;
    }

    if (matchRes.status === "fulfilled") {
      match = matchRes.value;
    }
  } catch {
    // Falls back to empty arrays without mock data
  }

  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-6">
      <NextFixtureHero match={match} />
      <SeasonSummaryTable standings={standings} seasonLabel={seasonLabel} />
    </div>
  );
}
