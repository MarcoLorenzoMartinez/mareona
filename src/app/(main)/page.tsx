import type { Metadata } from "next";
import { fetchStandings, fetchNextFixture } from "@/lib/sports-api/client";
import {
  getSeasonLabel,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "@/lib/sports-api/types";
import { NextFixtureHero } from "./temporada/next-fixture-hero";
import { SeasonSummaryTable } from "./temporada/season-summary-table";

export const metadata: Metadata = {
  title: "Mareona",
  description: "Actualidad, partidos, clasificación y actualidad del Real Sporting de Gijón.",
};

export default async function HomePage() {
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
    // Falls back to transparent empty state without fake data
  }

  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-6">
      <NextFixtureHero match={match} />
      <SeasonSummaryTable standings={standings} seasonLabel={seasonLabel} />
    </div>
  );
}

