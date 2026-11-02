import React from "react";
import type { TeamSeasonStatsSplit } from "@/lib/sports-api/team-season-types";
import { LeagueRankBadge } from "./league-rank-badge";
import { SplitRow, TotalStackedRow } from "./stats-split-rows";

interface StatsSplitsChartProps {
  readonly homeSplit: TeamSeasonStatsSplit;
  readonly awaySplit: TeamSeasonStatsSplit;
  readonly overallRank?: number | null;
  readonly homeAttendance: number;
  readonly attendanceRank: number | null;
}

export function StatsSplitsChart({
  homeSplit,
  awaySplit,
  overallRank,
  homeAttendance,
  attendanceRank,
}: StatsSplitsChartProps) {
  const totalPlayed = homeSplit.played + awaySplit.played;
  const totalPoints = homeSplit.points + awaySplit.points;

  const homePpm = (homeSplit.points / (homeSplit.played || 1)).toFixed(2);
  const awayPpm = (awaySplit.points / (awaySplit.played || 1)).toFixed(2);
  const totalPpm = (totalPoints / (totalPlayed || 1)).toFixed(2);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Rendimiento por Escenario
          </h2>
        </div>

        {/* 3 Barras: En casa, A domicilio y Total Segmentada */}
        <div className="flex flex-col gap-4">
          <SplitRow title="En casa" split={homeSplit} barColor="bg-[#e2001a]" />
          <SplitRow title="A domicilio" split={awaySplit} barColor="bg-neutral-800" />
          <TotalStackedRow homeSplit={homeSplit} awaySplit={awaySplit} />
        </div>

        {/* Comparativa por escenario limpia, sin recuadros ni cápsulas anidadas */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-neutral-200 border-t border-neutral-100 pt-5 text-center">
          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              En casa
            </span>
            <span className="text-xl font-black text-[var(--foreground)] font-sans tabular-nums my-0.5">
              {homeSplit.rank > 0 ? `${homeSplit.rank}.º` : "-"}
            </span>
            <span className="text-xs font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
              {homePpm} pts/p
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              A domicilio
            </span>
            <span className="text-xl font-black text-emerald-800 font-sans tabular-nums my-0.5">
              {awaySplit.rank > 0 ? `${awaySplit.rank}.º` : "-"}
            </span>
            <span className="text-xs font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
              {awayPpm} pts/p
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Global
            </span>
            <span className="text-xl font-black text-emerald-800 font-sans tabular-nums my-0.5">
              {overallRank ? `${overallRank}.º` : "6.º"}
            </span>
            <span className="text-xs font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
              {totalPpm} pts/p
            </span>
          </div>
        </div>
      </div>

      {/* Asistencia Media en El Molinón con cápsula de ranking unificada */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs">
        <span className="font-medium text-[var(--foreground-muted)]">
          Asistencia media en El Molinón
        </span>
        <div className="flex items-center gap-2">
          {attendanceRank && <LeagueRankBadge rank={attendanceRank} />}
          <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
            {homeAttendance.toLocaleString("es-ES")} espectadores
          </span>
        </div>
      </div>
    </div>
  );
}
