import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { fetchSportingSquad } from "@/lib/sports-api/client";
import { groupSquadByPosition, getSeasonLabel } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { SquadGroup } from "./squad-group";

export function generateMetadata(): Metadata {
  const dict = getDictionary();
  return {
    title: `${dict.season.squad.title} — Mareona`,
    description: dict.season.description,
  };
}

/**
 * Loading skeleton matching the 4-column card grid structure.
 */
function SquadSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-busy="true">
      {Array.from({ length: 2 }).map((_, gIdx) => (
        <div key={gIdx} className="flex flex-col gap-3.5">
          <div className="h-6 w-32 rounded-md bg-neutral-200" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {Array.from({ length: 4 }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-72 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Async squad page content fetching live data and rendering tactical categories.
 */
async function SquadContent() {
  await connection();

  const dict = getDictionary();
  const t = dict.season.squad;
  const seasonLabel = getSeasonLabel();
  const players = await fetchSportingSquad();
  const grouped = groupSquadByPosition(players);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">
        {t.title} — {dict.season.competitionName} {seasonLabel}
      </h1>

      {players.length > 0 ? (
        <>
          <SquadGroup
            title={t.groups.goalkeepers}
            players={grouped.goalkeepers}
          />
          <SquadGroup
            title={t.groups.defenders}
            players={grouped.defenders}
          />
          <SquadGroup
            title={t.groups.midfielders}
            players={grouped.midfielders}
          />
          <SquadGroup
            title={t.groups.forwards}
            players={grouped.forwards}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-2xs">
          <p className="text-sm text-[var(--foreground-muted)]">
            {t.noSquad}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PlantillaPage() {
  return (
    <Suspense fallback={<SquadSkeleton />}>
      <SquadContent />
    </Suspense>
  );
}
