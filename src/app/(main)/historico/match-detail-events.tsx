// Client: Cronología visual de goles del encuentro con balón oficial y tanteo parcial
"use client";

import type { HistoricalMatchGoal } from "@/lib/historical/types";
import { SoccerBallIcon } from "@/components/icons/soccer-ball-icon";

interface MatchDetailEventsProps {
  readonly goals: readonly HistoricalMatchGoal[];
  readonly homeTeam: string;
  readonly awayTeam: string;
}

/**
 * Visual chronological match timeline displaying goals with partial scores,
 * soccer ball icons, and team alignment matching the current season experience.
 */
export function HistoricalMatchEvents({
  goals,
  homeTeam,
  awayTeam,
}: MatchDetailEventsProps) {
  if (goals.length === 0) return null;

  const isHomeSporting = homeTeam === "Real Sporting";
  const isAwaySporting = awayTeam === "Real Sporting";

  return (
    <div className="my-3 max-w-xl mx-auto rounded-xl border border-[var(--border)] bg-neutral-50/70 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2 text-center">
        Goles del encuentro
      </div>

      <div className="relative">
        {/* Central vertical timeline bar */}
        <div
          className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-[var(--border)]"
          aria-hidden="true"
        />

        <div className="space-y-2">
          {goals.map((g, idx) => {
            const isHomeGoal = g.isHome ?? true;
            const isSporting = isHomeGoal ? isHomeSporting : isAwaySporting;

            return (
              <div
                key={`${g.scorer}-${g.minute}-${idx}`}
                className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-1"
              >
                {/* Home side */}
                <div className="flex items-center justify-end gap-1.5 text-right min-w-0">
                  {isHomeGoal && (
                    <>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                          {g.scorer}
                        </span>
                        {g.isPenalty && (
                          <span className="text-[10px] text-amber-700 font-bold">
                            Penalti
                          </span>
                        )}
                        {g.isOwnGoal && (
                          <span className="text-[10px] text-red-600 font-bold">
                            p.p.
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold font-sans tabular-nums text-white shadow-2xs shrink-0 ${
                          isSporting ? "bg-[var(--primary)]" : "bg-neutral-900"
                        }`}
                        title={`Gol (${g.score})`}
                      >
                        <SoccerBallIcon className="h-3 w-3 shrink-0" size={12} />
                        <span>{g.score}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Center minute badge */}
                <div className="relative z-10 flex items-center justify-center">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold font-sans tabular-nums text-[var(--foreground-muted)] border border-[var(--border)] shadow-2xs">
                    {g.minuteDisplay || g.minute}&apos;
                  </span>
                </div>

                {/* Away side */}
                <div className="flex items-center justify-start gap-1.5 text-left min-w-0">
                  {!isHomeGoal && (
                    <>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold font-sans tabular-nums text-white shadow-2xs shrink-0 ${
                          isSporting ? "bg-[var(--primary)]" : "bg-neutral-900"
                        }`}
                        title={`Gol (${g.score})`}
                      >
                        <SoccerBallIcon className="h-3 w-3 shrink-0" size={12} />
                        <span>{g.score}</span>
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                          {g.scorer}
                        </span>
                        {g.isPenalty && (
                          <span className="text-[10px] text-amber-700 font-bold">
                            Penalti
                          </span>
                        )}
                        {g.isOwnGoal && (
                          <span className="text-[10px] text-red-600 font-bold">
                            p.p.
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
