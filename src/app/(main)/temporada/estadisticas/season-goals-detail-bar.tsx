// Client: Minimalist active goal detail bar for the season goals pitch
"use client";

import type { TeamSeasonGoalItem } from "@/lib/sports-api/team-season-types";

interface SeasonGoalsDetailBarProps {
  readonly activeGoal: TeamSeasonGoalItem | null;
}

function formatGoalContext(sit?: string, type?: string): string {
  const sMap: Record<string, string> = {
    regularplay: "Jugada",
    fastbreak: "Contraataque",
    fromcorner: "Córner",
    penalty: "Penalti",
    freekick: "Falta directa",
    setpiece: "Balón parado",
  };
  const tMap: Record<string, string> = {
    rightfoot: "Pie derecho",
    leftfoot: "Pie izquierdo",
    header: "Cabeza",
  };
  const s = sMap[(sit ?? "").toLowerCase()] ?? sit;
  const t = tMap[(type ?? "").toLowerCase()] ?? type;
  return [s, t].filter(Boolean).join(" · ");
}

export function SeasonGoalsDetailBar({ activeGoal }: SeasonGoalsDetailBarProps) {
  return (
    <div className="min-h-[44px] flex items-center rounded-lg bg-[var(--surface)] px-3 py-2 text-xs">
      {activeGoal ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e2001a] shrink-0" aria-hidden="true" />
            <span className="font-bold text-[var(--foreground)]">{activeGoal.playerName}</span>
            <span className="font-sans font-semibold tabular-nums text-[var(--foreground-muted)]">
              Min {activeGoal.minute}&apos;
            </span>
            <span className="text-[var(--foreground-muted)]">vs {activeGoal.rivalName}</span>
            <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white">
              ¡Gol!
            </span>
          </div>

          <div className="flex items-center gap-3 font-sans tabular-nums text-[11px] text-[var(--foreground-muted)]">
            <span>
              xG: <strong className="text-[var(--foreground)]">{activeGoal.expectedGoals.toFixed(2)}</strong>
            </span>
            {activeGoal.expectedGoalsOnTarget !== undefined && (
              <span>
                xGOT: <strong className="text-[var(--foreground)]">{activeGoal.expectedGoalsOnTarget.toFixed(2)}</strong>
              </span>
            )}
            {formatGoalContext(activeGoal.situation, activeGoal.shotType) && (
              <span className="hidden sm:inline border-l border-[var(--border)] pl-2">
                {formatGoalContext(activeGoal.situation, activeGoal.shotType)}
              </span>
            )}
          </div>
        </div>
      ) : (
        <span className="text-xs text-[var(--foreground-muted)]">
          Toca o pasa el cursor sobre cualquier gol o sobre la portería para consultar el goleador, minuto y xG.
        </span>
      )}
    </div>
  );
}
