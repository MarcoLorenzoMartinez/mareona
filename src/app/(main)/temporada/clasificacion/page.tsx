import { cacheLife } from "next/cache";
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
    title: dict.season.standings.title,
    description: dict.season.description,
  };
}

export default async function ClasificacionPage() {
  "use cache";
  cacheLife("minutes");
  let standings: readonly DomainStandingRow[] = [];
  let matches: readonly DomainMatchSummary[] = [];

  try {
    const [standingsRes, matchesRes] = await Promise.all([
      fetchStandings(undefined, undefined, { includeSplits: true }),
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
