// Client: Portería frontal para los goles de la temporada coordinada con el campo
"use client";

import type { TeamSeasonGoalItem } from "@/lib/sports-api/team-season-types";

interface SeasonGoalPostProps {
  readonly goals: readonly TeamSeasonGoalItem[];
  readonly hoveredGoalId: number | null;
  readonly selectedGoalId: number | null;
  readonly onHoverGoal: (goal: TeamSeasonGoalItem | null) => void;
  readonly onSelectGoal: (goal: TeamSeasonGoalItem) => void;
}

export function SeasonGoalPost({
  goals,
  hoveredGoalId,
  selectedGoalId,
  onHoverGoal,
  onSelectGoal,
}: SeasonGoalPostProps) {
  // Match pitch priority so temporary hover overrides pinned selection and only one goal pulses
  const activeGoalId = hoveredGoalId ?? selectedGoalId;

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--border)]/60 bg-[var(--surface)]/30 p-2 text-center w-full max-w-[210px] shrink-0">
      <span className="text-[11px] font-bold text-[var(--foreground)]">
        Portería Rival
      </span>

      <div className="relative w-full aspect-[2/1] max-w-[190px]">
        <svg
          viewBox="0 0 120 60"
          className="h-full w-full select-none overflow-visible"
          aria-label="Vista frontal de la portería rival con la ubicación de los goles"
          onMouseLeave={() => onHoverGoal(null)}
        >
          {/* Sombra / Profundidad de la red */}
          <polygon points="15,12 105,12 110,6 10,6" fill="rgba(0,0,0,0.03)" />
          <polygon points="15,12 10,6 10,50 15,52" fill="rgba(0,0,0,0.02)" />
          <polygon points="105,12 110,6 110,50 105,52" fill="rgba(0,0,0,0.02)" />

          {/* Red técnica sutil */}
          <g stroke="var(--border)" strokeWidth="0.5" strokeOpacity="0.45" strokeDasharray="1.5 1.5">
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((x) => (
              <line key={`v-${x}`} x1={x} y1={12} x2={x} y2={52} />
            ))}
            {[20, 28, 36, 44].map((y) => (
              <line key={`h-${y}`} x1={15} y1={y} x2={105} y2={y} />
            ))}
          </g>

          {/* Línea de césped / base de la portería */}
          <line x1={5} y1={52} x2={115} y2={52} stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Postes y larguero */}
          <path
            d="M 15 52 L 15 12 L 105 12 L 105 52"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Impactos de gol sobre la portería */}
          {goals.map((goal) => {
            const isActive = activeGoalId === goal.id;

            // X va de 0 (poste izquierdo) a 2 (poste derecho)
            const rawX = goal.onGoalX ?? 1;
            const cx = 15 + (Math.min(Math.max(rawX, 0.05), 1.95) / 2) * 90;

            // Y normalizada de la red
            const rawY = goal.onGoalY ?? 0.25;
            const normZ = Math.min(Math.max(rawY / 0.65, 0.08), 0.95);
            const cy = 52 - normZ * 40;

            return (
              <g
                key={goal.id}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => onHoverGoal(goal)}
                onMouseLeave={() => onHoverGoal(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGoal(goal);
                }}
              >
                {isActive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="rgba(226, 0, 26, 0.25)"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill="#e2001a"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  className="shadow-sm"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
