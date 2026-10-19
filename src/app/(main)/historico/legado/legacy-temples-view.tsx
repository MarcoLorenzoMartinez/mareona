// Client: Vista cronológica de hitos históricos de El Molinón y la Escuela de Mareo
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { TempleMilestone } from "@/lib/historical/legacy-types";

type TempleFilter = "all" | "molinon" | "mareo";

interface LegacyTemplesViewProps {
  readonly milestones: readonly TempleMilestone[];
}

const TEMPLE_OPTIONS: readonly { id: TempleFilter; label: string }[] = [
  { id: "all", label: "Todos los hitos" },
  { id: "molinon", label: "El Molinón" },
  { id: "mareo", label: "Escuela de Mareo" },
];

export function LegacyTemplesView({ milestones }: LegacyTemplesViewProps) {
  const [filter, setFilter] = useState<TempleFilter>("all");

  const filteredMilestones = useMemo(() => {
    const list = filter === "all" ? milestones : milestones.filter((m) => m.temple === filter);
    return [...list].sort((a, b) => a.year - b.year);
  }, [milestones, filter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs">
          {TEMPLE_OPTIONS.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
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
          {filteredMilestones.length} {filteredMilestones.length === 1 ? "hito" : "hitos"}
        </span>
      </div>

      {/* Intro Banner: Pure White, Red accent */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-[var(--primary)]">
              Cuna y Templo
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] mt-2">
              El Molinón y la Escuela de Fútbol de Mareo
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
              El Molinón es el campo de fútbol profesional más antiguo de España (documentado desde 1908). Mareo, fundada en 1978, consolidó el modelo de cantera de donde surgieron generaciones legendarias.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative border-l-2 border-neutral-200 ml-4 sm:ml-6 pl-6 sm:pl-8 flex flex-col gap-8">
        {filteredMilestones.map((m, idx) => (
          <div key={`${m.temple}-${m.year}-${idx}`} className="relative group">
            {/* Timeline bullet */}
            <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-[var(--primary)] shadow-xs" />

            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-red-200 transition-all flex flex-col sm:flex-row gap-5 items-start">
              {m.photoUrl && (
                <div className="relative h-28 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-[var(--border)]">
                  <Image
                    src={m.photoUrl}
                    alt={m.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 160px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="rounded-full bg-[var(--primary)] text-white px-3 py-0.5 text-xs font-black tabular-nums">
                    {m.year}
                  </span>
                  <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                    {m.temple === "molinon" ? "El Molinón" : "Mareo"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {m.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
