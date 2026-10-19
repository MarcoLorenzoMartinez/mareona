// Client: Banquillo histórico con ranking de entrenadores por temporadas dirigidas
"use client";

import type { CoachRecord } from "@/lib/historical/legacy-types";

interface LegacyCoachesViewProps {
  readonly coaches: readonly CoachRecord[];
}

export function LegacyCoachesView({ coaches }: LegacyCoachesViewProps) {
  const top3 = coaches.slice(0, 3);
  const remaining = coaches.slice(3);

  return (
    <div className="flex flex-col gap-6">
      {/* Top 3 Coaches Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((coach, index) => {
          const medalBg =
            index === 0 ? "bg-amber-100 text-amber-900 border-amber-300" :
            index === 1 ? "bg-slate-100 text-slate-800 border-slate-300" :
            "bg-amber-50 text-amber-800 border-amber-200";

          return (
            <div
              key={coach.name}
              className="relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-red-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`h-7 w-7 rounded-full border text-xs font-black flex items-center justify-center tabular-nums ${medalBg}`}>
                    {index + 1}
                  </span>
                  <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-[var(--primary)] tabular-nums">
                    {coach.seasonsCount} temporadas
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {coach.name}
                </h3>
                {coach.milestone && (
                  <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {coach.milestone}
                  </p>
                )}
              </div>

              {/* Seasons list preview */}
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
                  Campañas dirigidas
                </span>
                <p className="text-xs text-[var(--foreground)] tabular-nums line-clamp-2">
                  {coach.seasonsList.join(", ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Coaches Ranking Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:px-5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Técnicos con mayor trayectoria en el banquillo rojiblanco
          </h3>
          <span className="text-xs text-[var(--muted-foreground)] font-medium tabular-nums">
            {coaches.length} entrenadores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--foreground)]">
            <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2.5 pl-4 pr-2 w-12 text-center font-bold">#</th>
                <th scope="col" className="py-2.5 px-3 font-bold">Entrenador</th>
                <th scope="col" className="py-2.5 px-3 text-right font-bold">Temporadas</th>
                <th scope="col" className="py-2.5 pl-3 pr-4 font-bold hidden sm:table-cell">Años / Hitos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {coaches.map((c) => (
                <tr key={c.name} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 pl-4 pr-2 text-center font-bold tabular-nums text-[var(--muted-foreground)]">
                    {c.rank}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[var(--foreground)] block">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)] tabular-nums sm:hidden">
                      {c.seasonsList.slice(0, 3).join(", ")}{c.seasonsList.length > 3 ? "..." : ""}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black tabular-nums text-[var(--primary)] text-sm">
                    {c.seasonsCount}
                  </td>
                  <td className="py-3 pl-3 pr-4 text-xs text-[var(--muted-foreground)] hidden sm:table-cell tabular-nums">
                    {c.milestone ? (
                      <span className="font-medium text-[var(--foreground)]">{c.milestone}</span>
                    ) : (
                      <span>{c.seasonsList.join(", ")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
