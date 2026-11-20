// Client: Mapa de goles de la temporada coordinado con campo horizontal y portería frontal
"use client";

import { useState } from "react";
import type { TeamSeasonGoalItem } from "@/lib/sports-api/team-season-types";
import { SeasonGoalPost } from "./season-goal-post";
import { SeasonGoalsDetailBar } from "./season-goals-detail-bar";

interface SeasonGoalsPitchProps {
  readonly goals: readonly TeamSeasonGoalItem[];
}

export function SeasonGoalsPitch({ goals }: SeasonGoalsPitchProps) {
  const [pinnedGoal, setPinnedGoal] = useState<TeamSeasonGoalItem | null>(null);
  const [hoveredGoal, setHoveredGoal] = useState<TeamSeasonGoalItem | null>(null);

  const activeGoal = hoveredGoal ?? pinnedGoal;

  if (goals.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          Mapa de Goles
        </h2>
        <span className="text-xs font-bold text-[var(--primary)] font-sans tabular-nums">
          {goals.length} goles marcados
        </span>
      </div>

      {/* Disposición coordinada: Campo reglamentario + Portería frontal rival */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
        {/* Campo horizontal completo (mismas medidas exactas y escala que el partido) */}
        <div className="flex flex-col gap-1.5 w-full max-w-lg">
          <div className="flex items-center justify-end text-[11px] font-semibold text-[var(--foreground-muted)] px-1">
            <span className="flex items-center gap-1.5">
              <span>Ataque Real Sporting →</span>
              <span className="h-2 w-2 rounded-full bg-[#e2001a]" />
            </span>
          </div>

          <svg
            viewBox="-2 -2 109 72"
            className="w-full rounded-lg bg-emerald-800/90 shadow-inner select-none"
            aria-label="Campo completo con todos los goles de la temporada"
            onMouseLeave={() => setHoveredGoal(null)}
          >
            {/* Perímetro del campo */}
            <rect
              x="0"
              y="0"
              width="105"
              height="68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
              opacity="0.75"
              onClick={() => setPinnedGoal(null)}
            />

            {/* Línea divisoria y círculo central */}
            <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#ffffff" strokeWidth="0.5" opacity="0.75" />
            <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.75" />
            <circle cx="52.5" cy="34" r="0.5" fill="#ffffff" opacity="0.8" />

            {/* Portería y Área Izquierda (Propia) */}
            <rect x="-1.2" y="30.34" width="1.2" height="7.32" fill="#ffffff" opacity="0.9" />
            <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <path d="M 16.5 26.69 A 9.15 9.15 0 0 1 16.5 41.31" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />

            {/* Portería y Área Derecha (Ataque Sporting) */}
            <rect x="105" y="30.34" width="1.2" height="7.32" fill="#ffffff" opacity="0.9" />
            <rect x="99.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <rect x="88.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <path d="M 88.5 26.69 A 9.15 9.15 0 0 0 88.5 41.31" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />

            {/* Goles del Real Sporting con tamaño idéntico al del detalle de partido */}
            {goals.map((goal) => {
              const cx = goal.x;
              const cy = 68 - goal.y;
              // Radio idéntico al de shot-map-canvas: min 0.9, max 2.1
              const radius = Math.max(0.9, Math.min(2.1, 0.9 + Math.sqrt(goal.expectedGoals) * 1.8));
              const isActive = activeGoal?.id === goal.id;

              return (
                <g
                  key={goal.id}
                  className="cursor-pointer"
                  onClick={() => setPinnedGoal((prev) => (prev?.id === goal.id ? null : goal))}
                  onMouseEnter={() => setHoveredGoal(goal)}
                  onMouseLeave={() => setHoveredGoal(null)}
                >
                  {isActive && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 0.8}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.4"
                      opacity={0.9}
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="#e2001a"
                    stroke="#f59e0b"
                    strokeWidth={0.55}
                    opacity={isActive ? 1 : 0.95}
                    className="transition-opacity duration-150"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Portería Frontal Coordinada (igual que en partidos) */}
        <SeasonGoalPost
          goals={goals}
          hoveredGoalId={hoveredGoal?.id ?? null}
          selectedGoalId={pinnedGoal?.id ?? null}
          onHoverGoal={setHoveredGoal}
          onSelectGoal={(g) => setPinnedGoal((prev) => (prev?.id === g.id ? null : g))}
        />
      </div>

      {/* Detalle minimalista del gol activo */}
      <SeasonGoalsDetailBar activeGoal={activeGoal} />
    </div>
  );
}
