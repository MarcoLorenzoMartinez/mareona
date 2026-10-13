import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import { getSeasonLabel } from "@/lib/sports-api/types";
import { MatchesList } from "./matches-list";

export const metadata: Metadata = {
  title: "Partidos del Sporting — Mareona",
  description: "Calendario completo y resultados del Real Sporting de Gijón.",
};

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

  const matches = await fetchSportingSeasonMatches();
  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] md:text-2xl">
          Calendario · LaLiga Hypermotion {seasonLabel}
        </h1>
        <span className="text-xs font-medium text-[var(--foreground-muted)]">
          Real Sporting
        </span>
      </div>

      {matches.length > 0 ? (
        <MatchesList matches={matches} />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white p-12 text-center shadow-2xs">
          <p className="text-sm text-[var(--foreground-muted)]">
            No se dispone del calendario de partidos en este momento.
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
