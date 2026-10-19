// Client: Vista detallada del cara a cara con un rival (estadísticas, desglose y partidos)
"use client";

import type { RivalH2HSummary } from "@/lib/historical/rivals-types";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import { TeamCrest } from "@/components/media/team-crest";
import { RivalCompetitionTable } from "./rival-competition-table";
import { RivalMatchRow } from "./rival-match-row";

interface RivalDetailViewProps {
  readonly rival: RivalH2HSummary;
  readonly onBack: () => void;
  readonly onSelectMatch: (match: DayMatchItem) => void;
}

/**
 * Editorial Head-to-Head profile for a selected rival.
 * Conforms to AGENTS.md rules 2, 3, 5, 8 and 9.
 */
export function RivalDetailView({ rival, onBack, onSelectMatch }: RivalDetailViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--foreground)] shadow-2xs hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer active:scale-95"
            aria-label="Volver al listado de rivales"
          >
            <svg
              className="h-3.5 w-3.5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Volver a rivales</span>
          </button>
          <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            {rival.isInternational ? rival.country : `${rival.province} (${rival.community})`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <TeamCrest crestUrl={rival.crestUrl} teamName={rival.name} size="lg" isSporting={false} />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {rival.name}
          </h2>
        </div>

        {/* Big Metrics Strip: Monocromía Editorial */}
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-neutral-50/40 py-3 text-center">
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Partidos</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{rival.played}</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Victorias</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{rival.won}</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Empates</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{rival.drawn}</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Derrotas</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{rival.lost}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Goles</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
              {rival.goalsFor} : {rival.goalsAgainst}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown by Competition */}
      <section aria-label="Desglose por competición" className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
          Balance por Competición
        </h3>
        <RivalCompetitionTable stats={rival.competitionsBreakdown} />
      </section>

      {/* Chronological Matches List */}
      <section aria-label="Historial cronológico de partidos" className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
          Partidos
        </h3>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xs divide-y divide-[var(--border)]/70">
          {rival.matches.map((match) => (
            <RivalMatchRow key={match.id} match={match} onSelect={onSelectMatch} />
          ))}
        </div>
      </section>
    </div>
  );
}
