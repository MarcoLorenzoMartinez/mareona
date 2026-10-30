import type { TeamSeasonStatsSplit } from "@/lib/sports-api/team-season-types";

interface StatsSplitsChartProps {
  readonly homeSplit: TeamSeasonStatsSplit;
  readonly awaySplit: TeamSeasonStatsSplit;
  readonly homeAttendance: number;
  readonly attendanceRank: number | null;
}

export function StatsSplitsChart({
  homeSplit,
  awaySplit,
  homeAttendance,
  attendanceRank,
}: StatsSplitsChartProps) {
  const totalHomePoints = homeSplit.points;
  const totalAwayPoints = awaySplit.points;
  const allPoints = totalHomePoints + totalAwayPoints || 1;
  const homePct = Math.round((totalHomePoints / allPoints) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            El Molinón vs Fuera
          </h2>
          {attendanceRank && (
            <span className="text-xs font-semibold text-[var(--foreground-muted)] font-sans tabular-nums">
              {attendanceRank}ª mayor asistencia de LaLiga
            </span>
          )}
        </div>

        {/* Visual Points Distribution Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--primary)] font-sans tabular-nums">En Casa: {homeSplit.points} pts</span>
            <span className="text-neutral-500 font-sans tabular-nums">Fuera: {awaySplit.points} pts</span>
          </div>

          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100"
            role="progressbar"
            aria-valuenow={homePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Distribución de puntos en casa y fuera"
          >
            <div
              style={{ width: `${homePct}%` }}
              className="bg-[#e2001a] transition-all duration-500"
            />
            <div
              style={{ width: `${awayPct}%` }}
              className="bg-neutral-300 transition-all duration-500"
            />
          </div>
        </div>

        {/* Comparative table */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-[var(--surface)] p-2.5">
            <span className="block text-[10px] font-bold uppercase text-[var(--foreground-muted)]">
              Balance
            </span>
            <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
              {homeSplit.wins}V - {homeSplit.draws}E - {homeSplit.losses}D
            </span>
            <span className="text-[10px] text-[var(--foreground-muted)]">En El Molinón</span>
          </div>

          <div className="rounded-lg bg-[var(--surface)] p-2.5">
            <span className="block text-[10px] font-bold uppercase text-[var(--foreground-muted)]">
              Goles C / F
            </span>
            <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
              {homeSplit.goalsFor}:{homeSplit.goalsAgainst} vs {awaySplit.goalsFor}:{awaySplit.goalsAgainst}
            </span>
            <span className="text-[10px] text-[var(--foreground-muted)]">Casa vs Fuera</span>
          </div>

          <div className="rounded-lg bg-[var(--surface)] p-2.5">
            <span className="block text-[10px] font-bold uppercase text-[var(--foreground-muted)]">
              Balance
            </span>
            <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
              {awaySplit.wins}V - {awaySplit.draws}E - {awaySplit.losses}D
            </span>
            <span className="text-[10px] text-[var(--foreground-muted)]">A domicilio</span>
          </div>
        </div>
      </div>

      {/* Stadium Attendance Highlight */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs">
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
