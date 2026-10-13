import { Suspense } from "react";
import { connection } from "next/server";
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

/**
 * Loading skeleton matching the minimalist Hero card and table layout.
 */
function SeasonSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true">
      <div className="h-44 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
      <div className="h-96 rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs" />
    </div>
  );
}

/**
 * Async content component fetching live sports data and delegating presentation.
 */
async function SeasonContent() {
  await connection();

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

/**
 * Root Server Component for /temporada.
 * Wraps dynamic content inside Suspense for streaming and Partial Prerendering compliance.
 */
export default function TemporadaPage() {
  return (
    <Suspense fallback={<SeasonSkeleton />}>
      <SeasonContent />
    </Suspense>
  );
}
