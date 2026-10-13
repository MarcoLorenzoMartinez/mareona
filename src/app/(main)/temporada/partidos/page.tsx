import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import { getSeasonLabel } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchesList } from "./matches-list";

export function generateMetadata(): Metadata {
  const dict = getDictionary();
  return {
    title: `${dict.season.matchesList.title} — Mareona`,
    description: dict.season.description,
  };
}

function PartidosSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true">
      <div className="h-10 w-64 rounded-md bg-neutral-200" />
      <div className="h-96 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
    </div>
  );
}

async function PartidosContent() {
  await connection();

  const dict = getDictionary();
  const matches = await fetchSportingSeasonMatches();
  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] md:text-2xl">
          {dict.season.matchesList.title}
        </h1>
        <p className="text-xs text-[var(--foreground-muted)]">
          {dict.season.competitionName} · {dict.season.seasonLabelPrefix} {seasonLabel}
        </p>
      </div>

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

export default function PartidosPage() {
  return (
    <Suspense fallback={<PartidosSkeleton />}>
      <PartidosContent />
    </Suspense>
  );
}
