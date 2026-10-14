"use client";
// Client: Interactive frontal goal post rendering on-target shots synchronized with pitch

import type { DomainShotItem } from "@/lib/sports-api/types";

interface ShotGoalPostProps {
  readonly title: string;
  readonly subtitle: string;
  readonly shots: readonly DomainShotItem[];
  readonly attackingColor: string;
  readonly hoveredShotId: number | null;
  readonly selectedShotId: number | null;
  readonly onHoverShot: (shot: DomainShotItem | null) => void;
  readonly onSelectShot: (shot: DomainShotItem) => void;
}

export function ShotGoalPost({
  title,
  subtitle,
  shots,
  attackingColor,
  hoveredShotId,
  selectedShotId,
  onHoverShot,
  onSelectShot,
}: ShotGoalPostProps) {
  // Only shots on target or goals that have onGoalShot or goal coordinates
  const onTargetShots = shots.filter((s) => s.isOnTarget || s.isGoal);

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--border)]/60 bg-[var(--surface)]/30 p-2 text-center w-full max-w-[200px]">
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-[var(--foreground)] truncate max-w-[170px]">{title}</span>
        <span className="text-[9px] font-medium text-[var(--foreground-muted)] truncate max-w-[170px]">{subtitle}</span>
      </div>

      <div className="relative w-full aspect-[2/1] max-w-[180px]">
        <svg
          viewBox="0 0 120 60"
          className="h-full w-full select-none overflow-visible"
          aria-label={`Vista frontal portería ${title}`}
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

          {/* Disparos a puerta sobre la red */}
          {onTargetShots.map((shot) => {
            const isHovered = hoveredShotId === shot.id;
            const isSelected = selectedShotId === shot.id;
            const isActive = isHovered || isSelected;

            // X va de 0 (poste izq) a 2 (poste dcho)
            const rawX = shot.onGoalShot?.x ?? 1;
            const cx = 15 + (Math.min(Math.max(rawX, 0), 2) / 2) * 90;

            // Z (altura en m, travesaño a 2.44m)
            const normZ = shot.goalCrossedZ !== null && shot.goalCrossedZ !== undefined
              ? Math.min(Math.max(shot.goalCrossedZ / 2.44, 0.08), 0.95)
              : Math.min(Math.max((shot.onGoalShot?.y ?? 0.3) / 0.65, 0.08), 0.95);
            const cy = 52 - normZ * 40;

            return (
              <g
                key={shot.id}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => onHoverShot(shot)}
                onMouseLeave={() => onHoverShot(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectShot(shot);
                }}
              >
                {isActive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={shot.isGoal ? 8 : 7}
                    fill={shot.isGoal ? "rgba(245, 158, 11, 0.3)" : "rgba(226, 0, 26, 0.2)"}
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={shot.isGoal ? 4.5 : 3.5}
                  fill={shot.isSporting ? "#e2001a" : attackingColor}
                  stroke={shot.isGoal ? "#f59e0b" : "#ffffff"}
                  strokeWidth={shot.isGoal ? 2 : 1.2}
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
