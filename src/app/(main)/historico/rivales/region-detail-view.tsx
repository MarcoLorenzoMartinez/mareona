// Client: Vista detallada de los rivales acumulados de una Comunidad Autónoma o País
"use client";

import type { RegionRivalSummary, RivalH2HSummary } from "@/lib/historical/rivals-types";
import { RivalCard } from "./rival-card";

interface RegionDetailViewProps {
  readonly region: RegionRivalSummary;
  readonly onBack: () => void;
  readonly onSelectRival: (rival: RivalH2HSummary) => void;
}

/**
 * Editorial summary view for a selected Autonomous Community or Country.
 */
export function RegionDetailView({ region, onBack, onSelectRival }: RegionDetailViewProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {region.regionName}
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] hover:border-neutral-300 hover:text-[var(--foreground)] transition-all cursor-pointer active:scale-95"
            aria-label="Cerrar detalle de la región"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-neutral-50/40 py-3 text-center">
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Partidos</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{region.totalMatches}</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Victorias</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{region.won}</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Empates</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{region.drawn}</span>
          </div>
          <div className="flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Derrotas</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">{region.lost}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Goles</span>
            <span className="mt-0.5 text-2xl font-black text-neutral-900 font-sans tabular-nums sm:text-3xl">
              {region.goalsFor} : {region.goalsAgainst}
            </span>
          </div>
        </div>
      </div>

      {/* Rivals Grid */}
      <section aria-label="Equipos de la región" className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
          Equipos de {region.regionName} ({region.rivals.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {region.rivals.map((rival) => (
            <RivalCard key={rival.name} rival={rival} onSelect={onSelectRival} />
          ))}
        </div>
      </section>
    </div>
  );
}
