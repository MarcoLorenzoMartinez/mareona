// Client: Muro interactivo de leyendas con filtros por época y apertura de ficha
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { LegendProfile } from "@/lib/historical/legacy-types";
import { LegendDetailDialog } from "./legend-detail-dialog";

type EraFilter = "all" | "pioneers" | "golden" | "modern";

interface LegacyLegendsWallProps {
  readonly legends: readonly LegendProfile[];
}

const ERA_OPTIONS: readonly { id: EraFilter; label: string }[] = [
  { id: "all", label: "Todas las épocas" },
  { id: "golden", label: "Generación Dorada" },
  { id: "pioneers", label: "Pioneros" },
  { id: "modern", label: "Era Moderna" },
];

export function LegacyLegendsWall({ legends }: LegacyLegendsWallProps) {
  const [selectedEra, setSelectedEra] = useState<EraFilter>("all");
  const [activeLegend, setActiveLegend] = useState<LegendProfile | null>(null);

  const filteredLegends = useMemo(() => {
    if (selectedEra === "all") return legends;
    return legends.filter((l) => l.era === selectedEra);
  }, [legends, selectedEra]);

  return (
    <div className="flex flex-col gap-6">
      {/* Era Filter Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs">
          {ERA_OPTIONS.map((opt) => {
            const isActive = selectedEra === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedEra(opt.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-2xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                aria-pressed={isActive}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-[var(--muted-foreground)] font-medium tabular-nums">
          {filteredLegends.length} {filteredLegends.length === 1 ? "leyenda" : "leyendas"}
        </span>
      </div>

      {/* Grid of Legends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredLegends.map((legend) => (
          <button
            key={legend.id}
            type="button"
            onClick={() => setActiveLegend(legend)}
            className="group relative flex flex-col text-left rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs hover:border-red-300 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            {/* Portrait Header */}
            <div className="relative h-44 w-full overflow-hidden rounded-xl bg-neutral-100 border border-[var(--border)] mb-3">
              <Image
                src={legend.photoUrl}
                alt={legend.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute top-2 left-2">
                <span className="rounded-full bg-black/70 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {legend.eraLabel}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted-foreground)]">
                    {legend.position ?? (legend.role === "coach" ? "Entrenador" : "Mito")}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--foreground)] tabular-nums">
                    {legend.yearsActive}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                  {legend.name}
                </h3>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                  {legend.summary}
                </p>
              </div>

              {/* Stats badges */}
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                {legend.totalPlayed !== undefined ? (
                  <span className="text-[var(--muted-foreground)]">
                    <strong className="text-[var(--foreground)] font-bold tabular-nums">{legend.totalPlayed}</strong> part.
                  </span>
                ) : (
                  <span className="text-[11px] text-[var(--primary)] font-semibold">Técnico histórico</span>
                )}
                {legend.totalGoals !== undefined && legend.totalGoals > 0 && (
                  <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-[var(--primary)] tabular-nums">
                    {legend.totalGoals} goles
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Dialog */}
      {activeLegend && (
        <LegendDetailDialog
          legend={activeLegend}
          onClose={() => setActiveLegend(null)}
        />
      )}
    </div>
  );
}
