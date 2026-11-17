// Client: Visualizador interactivo de mapas tácticos del Real Sporting (Calor, Pases y Carriles)
"use client";

import React, { useState } from "react";
import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";
import { TacticalPitchBackground } from "./tactical-pitch-background";
import { TacticalTeamHeatmap } from "./tactical-team-heatmap";

export type TacticalViewMode = "heatmap" | "passes" | "attack";

interface StatsPitchZonesProps {
  readonly stats: TeamSeasonStats;
}

export function StatsPitchZones({ stats }: StatsPitchZonesProps) {
  const [activeMode, setActiveMode] = useState<TacticalViewMode>("heatmap");

  const attackZones = stats.attackingZones ?? { left: 42, center: 28, right: 30 };
  const passTerritory = stats.passTerritory ?? {
    ownHalfPasses: 189,
    oppHalfPasses: 181,
    ownHalfPct: 51,
    oppHalfPct: 49,
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Ocupación del Campo
          </h2>

          {/* Selector estilo píldora unificado */}
          <div
            role="tablist"
            aria-label="Selector de visualización táctica"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "heatmap"}
              onClick={() => setActiveMode("heatmap")}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                activeMode === "heatmap"
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
              }`}
            >
              Mapa de Calor
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "passes"}
              onClick={() => setActiveMode("passes")}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                activeMode === "passes"
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
              }`}
            >
              Territorio del Pase
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "attack"}
              onClick={() => setActiveMode("attack")}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                activeMode === "attack"
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
              }`}
            >
              Carriles de Ataque
            </button>
          </div>
        </div>

        {/* Pitch Graphic Frame */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[#edf3ed] shadow-xs">
          {activeMode === "heatmap" ? (
            <TacticalTeamHeatmap circlesSvg={stats.heatmapCirclesSvg} />
          ) : (
            <>
              <div className="absolute inset-0 bg-[#1e5a3c]" />
              <TacticalPitchBackground />
            </>
          )}

          {/* MODO 2: Territorio del Pase (Campo Propio vs Campo Rival) */}
          {activeMode === "passes" && (
            <div className="absolute inset-0 grid grid-cols-2 text-white">
              <div className="flex flex-col items-center justify-center p-3 bg-emerald-950/25 border-r border-white/20 backdrop-blur-[1px]">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">
                  Campo Propio
                </span>
                <span className="text-3xl font-black font-sans tabular-nums my-0.5">
                  {passTerritory.ownHalfPct}%
                </span>
                <span className="text-xs font-semibold text-emerald-100 font-sans tabular-nums">
                  {passTerritory.ownHalfPasses} pases precisos
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-emerald-900/20 backdrop-blur-[1px]">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">
                  Campo Rival
                </span>
                <span className="text-3xl font-black font-sans tabular-nums my-0.5">
                  {passTerritory.oppHalfPct}%
                </span>
                <span className="text-xs font-semibold text-emerald-100 font-sans tabular-nums">
                  {passTerritory.oppHalfPasses} pases precisos
                </span>
              </div>
            </div>
          )}

          {/* MODO 3: Carriles de Ataque (Izquierda, Centro, Derecha) */}
          {activeMode === "attack" && (
            <div className="absolute inset-0 flex flex-col text-white">
              {/* Carril Izquierdo */}
              <div className="flex flex-1 items-center justify-between px-6 border-b border-white/15 bg-emerald-950/20">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">
                  Banda Izquierda
                </span>
                <span className="text-xl font-black font-sans tabular-nums text-white">
                  {attackZones.left}%
                </span>
              </div>

              {/* Carril Central */}
              <div className="flex flex-1 items-center justify-between px-6 border-b border-white/15 bg-emerald-900/10">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">
                  Centro
                </span>
                <span className="text-xl font-black font-sans tabular-nums text-white">
                  {attackZones.center}%
                </span>
              </div>

              {/* Carril Derecho */}
              <div className="flex flex-1 items-center justify-between px-6 bg-emerald-950/20">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">
                  Banda Derecha
                </span>
                <span className="text-xl font-black font-sans tabular-nums text-white">
                  {attackZones.right}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
