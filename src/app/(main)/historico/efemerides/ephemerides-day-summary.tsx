import type { DayMatchesBalance } from "@/lib/historical/ephemerides-types";

interface EphemeridesDaySummaryProps {
  readonly dateLabel: string;
  readonly balance: DayMatchesBalance;
  readonly milestonesCount: number;
  readonly isToday: boolean;
}

/**
 * Summary badge banner showing the balance of matches and landmarks for the active date.
 */
export function EphemeridesDaySummary({
  dateLabel,
  balance,
  milestonesCount,
  isToday,
}: EphemeridesDaySummaryProps) {
  const winPct = balance.played > 0 ? Math.round((balance.won / balance.played) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] md:text-2xl">
            {dateLabel}
          </h2>
          {isToday && (
            <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[11px] font-bold text-white">
              Hoy
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {milestonesCount > 0 && (
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">
              {milestonesCount} {milestonesCount === 1 ? "hito histórico" : "hitos históricos"}
            </span>
          )}
          <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] border border-[var(--border)]">
            {balance.played} {balance.played === 1 ? "partido oficial" : "partidos oficiales"}
          </span>
        </div>
      </div>

      {/* Numerical record pills */}
      {balance.played > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Victorias</span>
            <p className="mt-0.5 text-lg font-bold text-emerald-700 font-sans tabular-nums">
              {balance.won} ({winPct}%)
            </p>
          </div>

          <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Empates</span>
            <p className="mt-0.5 text-lg font-bold text-[var(--foreground)] font-sans tabular-nums">
              {balance.drawn}
            </p>
          </div>

          <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Derrotas</span>
            <p className="mt-0.5 text-lg font-bold text-red-700 font-sans tabular-nums">
              {balance.lost}
            </p>
          </div>

          <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Goles (GF - GC)</span>
            <p className="mt-0.5 text-lg font-bold text-[var(--foreground)] font-sans tabular-nums">
              {balance.goalsFor} - {balance.goalsAgainst}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)]">
          El Real Sporting no ha disputado ningún encuentro oficial de competición en esta fecha exacta a lo largo de sus 95 temporadas documentadas.
        </p>
      )}
    </div>
  );
}
