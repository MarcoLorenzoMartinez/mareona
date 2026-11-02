import type { TeamSeasonStatsSplit } from "@/lib/sports-api/team-season-types";

interface StatsSplitsChartProps {
  readonly homeSplit: TeamSeasonStatsSplit;
  readonly awaySplit: TeamSeasonStatsSplit;
  readonly homeAttendance: number;
  readonly attendanceRank: number | null;
}

interface SplitItemProps {
  readonly title: string;
  readonly split: TeamSeasonStatsSplit;
  readonly barColor: string;
}

function SplitRow({ title, split, barColor }: SplitItemProps) {
  const maxPoints = (split.played || 1) * 3;
  const points = split.points;
  const pct = Math.min(100, Math.round((points / maxPoints) * 100));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--foreground)]">
            {title}
          </span>
          <span className="text-[11px] font-semibold text-neutral-300">·</span>
          <span className="text-[11px] font-semibold text-[var(--foreground)] font-sans tabular-nums">
            {split.wins}V - {split.draws}E - {split.losses}D
          </span>
          <span className="text-[11px] font-semibold text-neutral-300">·</span>
          <span className="text-[11px] font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
            {split.goalsFor}:{split.goalsAgainst} goles
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 font-sans tabular-nums">
          <span className="text-sm font-black text-[var(--foreground)]">
            {points}{" "}
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              de {maxPoints} pts
            </span>
          </span>
          <span className="text-xs font-bold text-[var(--foreground-muted)]">
            ({pct}%)
          </span>
        </div>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Aprovechamiento de puntos: ${title}`}
      >
        <div
          style={{ width: `${pct}%` }}
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        />
      </div>
    </div>
  );
}

export function StatsSplitsChart({
  homeSplit,
  awaySplit,
  homeAttendance,
  attendanceRank,
}: StatsSplitsChartProps) {
  // Cálculo del split Total
  const totalPlayed = homeSplit.played + awaySplit.played;
  const totalPoints = homeSplit.points + awaySplit.points;
  const totalSplit: TeamSeasonStatsSplit = {
    played: totalPlayed,
    wins: homeSplit.wins + awaySplit.wins,
    draws: homeSplit.draws + awaySplit.draws,
    losses: homeSplit.losses + awaySplit.losses,
    goalsFor: homeSplit.goalsFor + awaySplit.goalsFor,
    goalsAgainst: homeSplit.goalsAgainst + awaySplit.goalsAgainst,
    points: totalPoints,
    rank: 0,
  };

  const homePpm = (homeSplit.points / (homeSplit.played || 1)).toFixed(2);
  const awayPpm = (awaySplit.points / (awaySplit.played || 1)).toFixed(2);
  const totalPpm = (totalPoints / (totalPlayed || 1)).toFixed(2);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Rendimiento: En casa, a domicilio y total
          </h2>
          {attendanceRank && (
            <span className="text-xs font-bold text-[#b80015] font-sans tabular-nums">
              {attendanceRank}.ª mayor asistencia de LaLiga
            </span>
          )}
        </div>

        {/* 3 Barras Independientes: En casa, A domicilio y Total */}
        <div className="flex flex-col gap-4">
          <SplitRow
            title="En casa"
            split={homeSplit}
            barColor="bg-[#e2001a]"
          />
          <SplitRow
            title="A domicilio"
            split={awaySplit}
            barColor="bg-neutral-800"
          />
          <SplitRow
            title="Total"
            split={totalSplit}
            barColor="bg-gradient-to-r from-[#e2001a] to-neutral-800"
          />
        </div>

        {/* Tarjetas comparativas de rendimiento para llenar armónicamente el espacio */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
          <div className="flex flex-col rounded-lg border border-[var(--border)]/70 bg-neutral-50/70 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              En Casa
            </span>
            <span className="text-base font-black text-[var(--foreground)] font-sans tabular-nums my-0.5">
              {homeSplit.rank > 0 ? `${homeSplit.rank}.º` : "-"}
            </span>
            <span className="text-[11px] font-semibold text-neutral-600 font-sans tabular-nums">
              {homePpm} pts/p
            </span>
          </div>

          <div className="flex flex-col rounded-lg border border-[var(--border)]/70 bg-neutral-50/70 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              A Domicilio
            </span>
            <span className="text-base font-black text-emerald-700 font-sans tabular-nums my-0.5">
              {awaySplit.rank > 0 ? `${awaySplit.rank}.º` : "-"}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 font-sans tabular-nums">
              {awayPpm} pts/p
            </span>
          </div>

          <div className="flex flex-col rounded-lg border border-[var(--border)]/70 bg-neutral-50/70 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Global
            </span>
            <span className="text-base font-black text-[var(--primary)] font-sans tabular-nums my-0.5">
              {totalPoints} pts
            </span>
            <span className="text-[11px] font-semibold text-neutral-600 font-sans tabular-nums">
              {totalPpm} pts/p
            </span>
          </div>
        </div>
      </div>

      {/* Asistencia Media en El Molinón */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
        <span className="font-medium text-[var(--foreground-muted)]">
          Asistencia media en El Molinón
        </span>
        <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
          {homeAttendance.toLocaleString("es-ES")} espectadores
        </span>
      </div>
    </div>
  );
}
