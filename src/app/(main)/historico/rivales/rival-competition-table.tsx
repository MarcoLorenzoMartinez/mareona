// Client: Desglose por competición de los enfrentamientos directos
"use client";

import type { CompetitionStats } from "@/lib/historical/rivals-types";

interface RivalCompetitionTableProps {
  readonly stats: readonly CompetitionStats[];
}

/**
 * Editorial table breaking down head-to-head records by competition/division.
 * Adheres to AGENTS.md rule 5: font-sans tabular-nums, clean border-b styling.
 */
export function RivalCompetitionTable({ stats }: RivalCompetitionTableProps) {
  if (stats.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[var(--border)] bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            <th scope="col" className="py-2.5 px-3">Competición</th>
            <th scope="col" className="py-2.5 px-3 text-center">PJ</th>
            <th scope="col" className="py-2.5 px-3 text-center">V</th>
            <th scope="col" className="py-2.5 px-3 text-center">E</th>
            <th scope="col" className="py-2.5 px-3 text-center">D</th>
            <th scope="col" className="py-2.5 px-3 text-center">GF</th>
            <th scope="col" className="py-2.5 px-3 text-center">GC</th>
            <th scope="col" className="py-2.5 px-3 text-right">Dif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/70 font-sans tabular-nums">
          {stats.map((c) => {
            const diff = c.goalsFor - c.goalsAgainst;
            return (
              <tr key={c.competition} className="hover:bg-neutral-50/50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-[var(--foreground)]">{c.competition}</td>
                <td className="py-2.5 px-3 text-center font-black text-neutral-900">{c.played}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-neutral-900">{c.won}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-neutral-600">{c.drawn}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-neutral-600">{c.lost}</td>
                <td className="py-2.5 px-3 text-center font-black text-neutral-900">{c.goalsFor}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-neutral-600">{c.goalsAgainst}</td>
                <td className={`py-2.5 px-3 text-right font-black ${diff > 0 ? "text-emerald-700" : diff < 0 ? "text-rose-700" : "text-neutral-500"}`}>
                  {diff > 0 ? `+${diff}` : diff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
