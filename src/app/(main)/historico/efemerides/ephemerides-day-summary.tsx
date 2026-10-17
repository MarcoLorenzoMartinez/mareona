import type { DayMatchesBalance } from "@/lib/historical/ephemerides-types";

interface EphemeridesDaySummaryProps {
  readonly dateLabel: string;
  readonly balance: DayMatchesBalance | null;
  readonly milestonesCount: number;
  readonly isToday: boolean;
  readonly isLoading?: boolean;
}

/**
 * Clean corporate summary card complementing the calendar in equal height.
 * Displays key historical stats (W-D-L, win rate, goals, and milestones) with Sporting red accents.
 */
export function EphemeridesDaySummary({
  dateLabel,
  balance,
  milestonesCount,
  isToday,
  isLoading = false,
}: EphemeridesDaySummaryProps) {
  if (isLoading || !balance) {
    return (
      <div className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs min-h-[300px]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              {dateLabel}
            </h2>
            {isToday && (
              <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                Hoy
              </span>
            )}
          </div>
          <div className="h-6 w-28 rounded-full bg-[var(--surface)] animate-pulse border border-[var(--border)]" />
        </div>

        <div className="my-auto grid grid-cols-3 divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-neutral-50/50 py-4">
          <div className="flex flex-col items-center gap-1"><div className="h-3 w-12 rounded bg-[var(--surface)] animate-pulse" /><div className="h-7 w-8 rounded bg-[var(--surface)] animate-pulse" /></div>
          <div className="flex flex-col items-center gap-1"><div className="h-3 w-12 rounded bg-[var(--surface)] animate-pulse" /><div className="h-7 w-8 rounded bg-[var(--surface)] animate-pulse" /></div>
          <div className="flex flex-col items-center gap-1"><div className="h-3 w-12 rounded bg-[var(--surface)] animate-pulse" /><div className="h-7 w-8 rounded bg-[var(--surface)] animate-pulse" /></div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)]/70 pt-3">
          <div className="h-4 w-32 rounded bg-[var(--surface)] animate-pulse" />
          <div className="h-4 w-24 rounded bg-[var(--surface)] animate-pulse" />
        </div>
      </div>
    );
  }

  const winPct = balance.played > 0 ? Math.round((balance.won / balance.played) * 100) : 0;
  const isPositive = balance.won > balance.lost;
  const isNeutral = balance.won === balance.lost;

  return (
    <div className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs min-h-[300px]">
      {/* Top Header: Date title + Today badge + Match count badges */}
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {dateLabel}
          </h2>
          {isToday && (
            <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
              Hoy
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {milestonesCount > 0 && (
            <span className="rounded-full border border-[var(--primary)]/20 bg-red-50/70 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
              {milestonesCount} {milestonesCount === 1 ? "hito" : "hitos"}
            </span>
          )}
          <span className="rounded-full border border-[var(--border)] bg-neutral-50 px-2.5 py-0.5 text-xs font-semibold text-[var(--foreground)] font-sans tabular-nums">
            {balance.played} {balance.played === 1 ? "partido oficial" : "partidos oficiales"}
          </span>
        </div>
      </div>

      {/* Center: W-D-L Metric Strip */}
      {balance.played > 0 ? (
        <div className="my-auto grid grid-cols-3 divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-neutral-50/40 py-3 text-center sm:py-4">
          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Victorias
            </span>
            <span className="mt-1 text-2xl font-extrabold text-[var(--primary)] font-sans tabular-nums sm:text-3xl">
              {balance.won}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Empates
            </span>
            <span className="mt-1 text-2xl font-bold text-[var(--foreground)] font-sans tabular-nums sm:text-3xl">
              {balance.drawn}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Derrotas
            </span>
            <span className="mt-1 text-2xl font-bold text-[var(--muted-foreground)] font-sans tabular-nums sm:text-3xl">
              {balance.lost}
            </span>
          </div>
        </div>
      ) : (
        <div className="my-auto flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Sin partidos oficiales en esta fecha
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            El Real Sporting no disputó ningún encuentro de competición en este día del calendario.
          </p>
        </div>
      )}

      {/* Bottom Insights: Efficiency Rate, Goals and Historical Trend */}
      {balance.played > 0 && (
        <div className="flex flex-col gap-2 border-t border-[var(--border)]/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <span>
              Efectividad:{" "}
              <strong className="font-bold text-[var(--foreground)] font-sans tabular-nums">
                {winPct}%
              </strong>
            </span>
            <span aria-hidden="true" className="text-[var(--border)]">·</span>
            <span>
              Goles:{" "}
              <strong className="font-bold text-[var(--foreground)] font-sans tabular-nums">
                {balance.goalsFor}
              </strong>{" "}
              favor /{" "}
              <strong className="font-bold text-[var(--foreground)] font-sans tabular-nums">
                {balance.goalsAgainst}
              </strong>{" "}
              contra
            </span>
          </div>

          <div>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isPositive
                  ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-800"
                  : isNeutral
                  ? "border border-[var(--border)] bg-neutral-100 text-[var(--muted-foreground)]"
                  : "border border-red-500/25 bg-red-500/10 text-red-800"
              }`}
            >
              {isPositive ? "Balance favorable" : isNeutral ? "Equilibrio histórico" : "Balance adverso"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
