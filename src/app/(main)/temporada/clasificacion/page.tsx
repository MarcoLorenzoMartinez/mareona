import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { fetchStandings, fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import {
  getSeasonLabel,
  getSportingSeasonEvolution,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { StandingsView } from "./standings-view";

export function generateMetadata(): Metadata {
  const dict = getDictionary();
  return {
    title: `${dict.season.standings.title} — Mareona`,
    description: dict.season.description,
  };
}

function ClasificacionSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-busy="true">
      <div className="flex justify-between items-center">
        <div className="h-8 w-44 rounded-md bg-[var(--surface)]" />
        <div className="h-9 w-52 rounded-md bg-[var(--surface)]" />
      </div>
      <div className="h-[600px] rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs" />
    </div>
  );
}

async function ClasificacionContent() {
  await connection();

  let standings: readonly DomainStandingRow[] = [];
  let matches: readonly DomainMatchSummary[] = [];

  try {
    const [standingsRes, matchesRes] = await Promise.all([
      fetchStandings(),
      fetchSportingSeasonMatches(),
    ]);
    standings = standingsRes;
    matches = matchesRes;
  } catch {
    // Si la llamada falla, no se inventan datos de muestra: standings y matches permanecen vacíos
  }

  const sportingStanding = standings.find((r) => r.isSporting) ?? null;
  const evolution = getSportingSeasonEvolution(matches, sportingStanding);
  const seasonLabel = getSeasonLabel();

  return (
    <StandingsView
      initialStandings={standings}
      seasonLabel={seasonLabel}
      evolution={evolution}
    />
  );
}

export default function ClasificacionPage() {
  return (
    <Suspense fallback={<ClasificacionSkeleton />}>
      <ClasificacionContent />
    </Suspense>
  );
}
