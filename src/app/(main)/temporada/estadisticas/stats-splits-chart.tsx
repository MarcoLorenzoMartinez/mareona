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
            Rendimiento: En casa, a domicilio y total
          </h2>
        </div>

        {/* 3 Barras: En casa, A domicilio y Total Segmentada */}
        <div className="flex flex-col gap-4">
          <SplitRow title="En casa" split={homeSplit} barColor="bg-[#e2001a]" />
          <SplitRow title="A domicilio" split={awaySplit} barColor="bg-neutral-800" />
          <TotalStackedRow homeSplit={homeSplit} awaySplit={awaySplit} />
        </div>

        {/* Tarjetas comparativas con escala cromática deportiva oficial */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
          <div className="flex flex-col items-center rounded-lg border border-[var(--border)]/70 bg-neutral-50/70 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              En Casa
            </span>
            <div className="my-1">
              <LeagueRankBadge rank={homeSplit.rank} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-600 font-sans tabular-nums">
              {homePpm} pts/p
            </span>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-[var(--border)]/70 bg-neutral-50/70 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              A Domicilio
            </span>
            <div className="my-1">
              <LeagueRankBadge rank={awaySplit.rank} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-600 font-sans tabular-nums">
              {awayPpm} pts/p
            </span>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-[var(--border)]/70 bg-neutral-50/70 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Global
            </span>
            <div className="my-1">
              <LeagueRankBadge rank={overallRank ?? 6} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-600 font-sans tabular-nums">
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
