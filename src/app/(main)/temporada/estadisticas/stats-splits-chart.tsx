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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--foreground)]">
            {title}
          </span>
          <span className="text-[11px] font-semibold text-neutral-400">·</span>
          <span className="text-[11px] font-semibold text-[var(--foreground)] font-sans tabular-nums">
            {split.wins}V - {split.draws}E - {split.losses}D
          </span>
          <span className="text-[11px] font-semibold text-neutral-400">·</span>
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
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Rendimiento: El Molinón vs Fuera
          </h2>
          {attendanceRank && (
            <span className="text-xs font-bold text-[#b80015] font-sans tabular-nums">
              {attendanceRank}.ª mayor asistencia de LaLiga
            </span>
          )}
        </div>

        {/* Independent Home and Away Progress Bars */}
        <div className="flex flex-col gap-6">
          <SplitRow
            title="En Casa"
            split={homeSplit}
            barColor="bg-[#e2001a]"
          />
          <SplitRow
            title="A domicilio"
            split={awaySplit}
            barColor="bg-neutral-800"
          />
        </div>
      </div>

      {/* Stadium Attendance Highlight */}
      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
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
