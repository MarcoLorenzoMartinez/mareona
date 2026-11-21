import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import { getSeasonLabel } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchesList } from "./matches-list";

export function generateMetadata(): Metadata {
  const dict = getDictionary();
  return {
    title: dict.season.matchesList.title,
    description: dict.season.description,
  };
}

export default async function PartidosPage() {
  "use cache";
  cacheLife("minutes");
  const dict = getDictionary();
  const matches = await fetchSportingSeasonMatches();
  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">
        {dict.season.matchesList.title} — {dict.season.competitionName} {seasonLabel}
      </h1>

      {matches.length > 0 ? (
        <MatchesList matches={matches} />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white p-12 text-center shadow-2xs">
          <p className="text-sm text-[var(--foreground-muted)]">
            {dict.season.matchesList.noCalendar}
          </p>
        </div>
      )}
    </div>
  );
}
