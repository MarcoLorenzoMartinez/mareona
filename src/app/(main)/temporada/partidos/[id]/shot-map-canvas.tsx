"use client";

// Client: Requiere interactividad para seleccionar filtros de equipo y mostrar tooltip flotante con xG del tiro.
import { useState } from "react";
import type { DomainShotItem } from "@/lib/sports-api/types";
import { ShotGoalPost } from "./shot-goal-post";

interface ShotMapCanvasProps {
  readonly shots: readonly DomainShotItem[];
  readonly homeTeamName?: string;
  readonly awayTeamName?: string;
  readonly rivalName?: string;
}

function formatShotContext(type?: string, sit?: string): string {
  const tMap: Record<string, string> = { rightfoot: "Pie derecho", leftfoot: "Pie izquierdo", header: "Cabeza" };
  const sMap: Record<string, string> = { regularplay: "Jugada", individualplay: "Acción individual", fastbreak: "Contra", fromcorner: "Córner", penalty: "Penalti" };
  return [tMap[(type ?? "").toLowerCase()] ?? type, sMap[(sit ?? "").toLowerCase()] ?? sit].filter(Boolean).join(" · ");
}

export function ShotMapCanvas({ shots, homeTeamName = "Rival", awayTeamName = "Real Sporting", rivalName: propRivalName }: ShotMapCanvasProps) {
  const rivalName = propRivalName ?? (homeTeamName.includes("Sporting") ? awayTeamName : homeTeamName);
  const [activeFilter, setActiveFilter] = useState<"all" | "sporting" | "opponent">("all");
  const [pinnedShot, setPinnedShot] = useState<DomainShotItem | null>(null);
  const [hoveredShot, setHoveredShot] = useState<DomainShotItem | null>(null);
  const activeShot = hoveredShot ?? pinnedShot;

  const filteredShots = shots.filter((s) =>
    activeFilter === "sporting" ? s.isSporting : activeFilter === "opponent" ? !s.isSporting : true
  );

  const sportingShots = shots.filter((s) => s.isSporting);
  const rivalShots = shots.filter((s) => !s.isSporting);
  const getShotColor = (shot: DomainShotItem) => (shot.isSporting ? "#e2001a" : "#27272a");

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Mapa de Tiros y xG</h3>
        <div className="inline-flex rounded-full bg-[var(--surface)] p-1 border border-[var(--border)]">
          {(["all", "sporting", "opponent"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`rounded-full px-3 py-0.5 text-xs font-semibold transition-colors ${
                activeFilter === key ? (key === "sporting" ? "bg-[var(--primary)] text-white" : "bg-neutral-900 text-white") : "text-[var(--foreground-muted)]"
              }`}
            >
              {key === "all" ? `Todos (${shots.length})` : key === "sporting" ? `Sporting (${sportingShots.length})` : `${rivalName} (${rivalShots.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Disposición coordinada: Portería Izq + Campo Horizontal + Portería Dcha */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
        <div className="order-2 lg:order-1 shrink-0 w-full lg:w-auto flex justify-center">
          <ShotGoalPost
            title="Portería Sporting" subtitle={`Tiros recibidos (${rivalName})`}
            shots={rivalShots} attackingColor="#27272a"
            hoveredShotId={hoveredShot?.id ?? null} selectedShotId={pinnedShot?.id ?? null}
            onHoverShot={setHoveredShot} onSelectShot={(s) => setPinnedShot((prev) => (prev?.id === s.id ? null : s))}
          />
        </div>

        <div className="order-1 lg:order-2 flex flex-col gap-1.5 w-full max-w-lg">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--foreground-muted)] px-1">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#27272a]" /><span>← Ataque {rivalName}</span></span>
            <span className="flex items-center gap-1.5"><span>Ataque Real Sporting →</span><span className="h-2 w-2 rounded-full bg-[#e2001a]" /></span>
          </div>

          <svg
            viewBox="-2 -2 109 72"
            className="w-full rounded-lg bg-emerald-800/90 shadow-inner"
            aria-label="Campo de tiros completo"
            onMouseLeave={() => setHoveredShot(null)}
          >
            <rect x="0" y="0" width="105" height="68" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.75" onClick={() => setPinnedShot(null)} />
            <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#ffffff" strokeWidth="0.5" opacity="0.75" />
            <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.75" />
            <circle cx="52.5" cy="34" r="0.5" fill="#ffffff" opacity="0.8" />
            <rect x="-1.2" y="30.34" width="1.2" height="7.32" fill="#ffffff" opacity="0.9" />
            <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" /><path d="M 16.5 26.69 A 9.15 9.15 0 0 1 16.5 41.31" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <rect x="105" y="30.34" width="1.2" height="7.32" fill="#ffffff" opacity="0.9" />
            <rect x="99.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />
            <rect x="88.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" /><path d="M 88.5 26.69 A 9.15 9.15 0 0 0 88.5 41.31" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.75" />

            {filteredShots.map((shot) => {
              const cx = shot.isSporting ? shot.x : 105 - shot.x;
              const cy = shot.isSporting ? 68 - shot.y : shot.y;
              const radius = Math.max(0.9, Math.min(2.1, 0.9 + Math.sqrt(shot.expectedGoals) * 1.8));
              const isActive = activeShot?.id === shot.id;

              return (
                <g
                  key={shot.id}
                  className="cursor-pointer"
                  onClick={() => setPinnedShot((prev) => (prev?.id === shot.id ? null : shot))}
                  onMouseEnter={() => setHoveredShot(shot)}
                  onMouseLeave={() => setHoveredShot(null)}
                >
                  {isActive && <circle cx={cx} cy={cy} r={radius + 0.8} fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.8" />}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={getShotColor(shot)}
                    stroke={shot.isGoal ? "#f59e0b" : "#ffffff"}
                    strokeWidth={shot.isGoal ? "0.55" : "0.3"}
                    opacity={isActive ? 1 : shot.isGoal ? 0.95 : 0.55}
                    className="transition-opacity duration-150"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="order-3 shrink-0 w-full lg:w-auto flex justify-center">
          <ShotGoalPost
            title={`Portería ${rivalName}`} subtitle="Tiros a puerta Sporting"
            shots={sportingShots} attackingColor="#e2001a"
            hoveredShotId={hoveredShot?.id ?? null} selectedShotId={pinnedShot?.id ?? null}
            onHoverShot={setHoveredShot} onSelectShot={(s) => setPinnedShot((prev) => (prev?.id === s.id ? null : s))}
          />
        </div>
      </div>

      {/* Detalle minimalista del tiro activo */}
      <div className="min-h-[44px] flex items-center rounded-lg bg-[var(--surface)] px-3 py-2 text-xs">
        {activeShot ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getShotColor(activeShot) }} aria-hidden="true" />
              <span className="font-bold text-[var(--foreground)]">{activeShot.playerName}</span>
              <span className="font-sans font-semibold tabular-nums text-[var(--foreground-muted)]">{activeShot.minute}&apos;</span>
              {activeShot.isGoal ? (
                <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white">¡Gol!</span>
              ) : (
                <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                  {activeShot.isOnTarget ? "A puerta" : activeShot.isBlocked ? "Bloqueado" : "Fuera"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--foreground-muted)]">{formatShotContext(activeShot.shotType, activeShot.situation)}</span>
              <span className="font-sans font-bold tabular-nums text-[var(--foreground)]">
                {activeShot.expectedGoals} <span className="text-[10px] font-normal text-[var(--foreground-muted)]">xG</span>
              </span>
              {activeShot.expectedGoalsOnTarget !== null && (
                <span className="font-sans font-bold tabular-nums text-[var(--foreground)] border-l border-[var(--border)] pl-2">
                  {activeShot.expectedGoalsOnTarget} <span className="text-[10px] font-normal text-[var(--foreground-muted)]">xGOT</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="w-full text-center text-[11px] text-[var(--foreground-muted)]">
            Selecciona un tiro para ver su detalle.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--foreground-muted)] border-t border-[var(--border)] pt-2.5">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#e2001a]" /><span>Real Sporting</span></span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#27272a]" /><span>{rivalName}</span></span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-[#f59e0b] bg-neutral-800" /><span>Gol (borde amarillo)</span></span>
      </div>
    </div>
  );
}
