import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import { TeamCrest } from "@/components/media/team-crest";

interface EphemeridesMatchesListProps {
  readonly matches: readonly DayMatchItem[];
}

/**
 * Renders the list of official historical matches played on the chosen calendar date.
 */
export function EphemeridesMatchesList({ matches }: EphemeridesMatchesListProps) {
  if (matches.length === 0) return null;

  return (
    <section aria-label="Partidos oficiales disputados en esta fecha" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
        Partidos de este día en la historia ({matches.length})
      </h3>

      <div className="flex flex-col gap-2.5">
        {matches.map((m) => {
          const isWin = m.outcome === "V";
          const isDraw = m.outcome === "E";

          return (
            <article
              key={m.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs hover:border-[var(--border)]/80 sm:flex-row sm:items-center"
            >
              {/* Competition & Year Metadata */}
              <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-start sm:gap-1 min-w-32">
                <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white font-sans tabular-nums">
                  {m.year}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {m.competition}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    {m.round} · {m.season}
                  </span>
                </div>
              </div>

              {/* Matchup with Crests & Result */}
              <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
                <div className="flex flex-1 items-center justify-end gap-2 text-right min-w-0">
                  <span
                    className={`truncate text-xs sm:text-sm ${
                      m.isHome ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--foreground)]"
                    }`}
                  >
                    {m.homeTeam}
                  </span>
                  <TeamCrest
                    crestUrl={m.homeCrestUrl}
                    teamName={m.homeTeam}
                    size="sm"
                    isSporting={m.isHome}
                  />
                </div>

                <div className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] px-3 py-1 font-sans text-base font-extrabold tabular-nums tracking-tight text-[var(--foreground)] border border-[var(--border)]">
                  {m.homeScore} - {m.awayScore}
                </div>

                <div className="flex flex-1 items-center justify-start gap-2 text-left min-w-0">
                  <TeamCrest
                    crestUrl={m.awayCrestUrl}
                    teamName={m.awayTeam}
                    size="sm"
                    isSporting={!m.isHome}
                  />
                  <span
                    className={`truncate text-xs sm:text-sm ${
                      !m.isHome ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--foreground)]"
                    }`}
                  >
                    {m.awayTeam}
                  </span>
                </div>
              </div>

              {/* Outcome Badge & Stadium */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-1 min-w-24">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isWin
                      ? "bg-emerald-500/15 text-emerald-700"
                      : isDraw
                      ? "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]"
                      : "bg-red-500/10 text-red-700"
                  }`}
                >
                  {isWin ? "Victoria" : isDraw ? "Empate" : "Derrota"}
                </span>
                {m.venue && (
                  <span className="text-[11px] text-[var(--muted-foreground)] truncate max-w-32">
                    {m.venue}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
