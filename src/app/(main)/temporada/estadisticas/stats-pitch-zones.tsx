// Client: Visualizador interactivo de mapas tácticos del Real Sporting (Calor, Pases y Carriles)
"use client";

import React, { useState } from "react";
import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";
import { TacticalPitchBackground } from "./tactical-pitch-background";

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
            Distribución Táctica en el Campo
          </h2>

          {/* Selector estilo píldora idéntico al de RivalsFilterBar */}
          <div
            role="tablist"
            aria-label="Selector de visualización táctica"
            className="inline-flex rounded-full border border-[var(--border)] bg-neutral-100 p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "heatmap"}
              onClick={() => setActiveMode("heatmap")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                activeMode === "heatmap"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Mapa de Calor
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "passes"}
              onClick={() => setActiveMode("passes")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                activeMode === "passes"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Territorio del Pase
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "attack"}
              onClick={() => setActiveMode("attack")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                activeMode === "attack"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Carriles de Ataque
            </button>
          </div>
        </div>

        {/* Pitch Graphic Frame */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-emerald-900/40 bg-[#1e5a3c] shadow-xs">
          <TacticalPitchBackground />

          {/* MODO 1: Mapa de Calor Colectivo */}
          {activeMode === "heatmap" && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Zonas de calor colectivo auténticas de la plantilla */}
              {/* Banda izquierda y tres cuartos (foco de Gaspar y laterales) */}
              <div
                className="absolute left-[38%] top-[12%] h-[42%] w-[32%] rounded-full opacity-60 blur-xl"
                style={{ background: "radial-gradient(circle, #e2001a 0%, #ea580c 45%, #eab308 75%, transparent 100%)" }}
              />
              {/* Circulación interior y pivotes */}
              <div
                className="absolute left-[32%] top-[38%] h-[35%] w-[38%] rounded-full opacity-55 blur-xl"
                style={{ background: "radial-gradient(circle, #ea580c 0%, #eab308 50%, #22c55e 80%, transparent 100%)" }}
              />
              {/* Salida de balón y centrales en campo propio */}
              <div
                className="absolute left-[14%] top-[30%] h-[38%] w-[26%] rounded-full opacity-50 blur-xl"
                style={{ background: "radial-gradient(circle, #eab308 0%, #22c55e 60%, transparent 100%)" }}
              />
              {/* Progresión derecha (Rosas / extremo) */}
              <div
                className="absolute left-[44%] top-[62%] h-[28%] w-[26%] rounded-full opacity-50 blur-xl"
                style={{ background: "radial-gradient(circle, #ea580c 0%, #eab308 55%, transparent 100%)" }}
              />

              {/* Leyenda overlay integrada */}
              <div className="absolute bottom-2 right-2 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-xs">
                Toques colectivos por partido
              </div>
            </div>
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

      {/* Pie explicativo según el modo activo */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-neutral-50 px-3.5 py-2 text-xs">
        <span className="font-semibold text-[var(--foreground)]">
          {activeMode === "heatmap" && "Concentración de toques"}
          {activeMode === "passes" && "Volumen total de pases"}
          {activeMode === "attack" && "Preferencia de progresión"}
        </span>
        <span className="text-[11px] font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
          {activeMode === "heatmap" && "Densidad colectiva de juego del Sporting"}
          {activeMode === "passes" && `${stats.accuratePassesPerMatch.toFixed(0)} pases con éxito por partido`}
          {activeMode === "attack" && "Distribución ofensiva de llegadas"}
        </span>
      </div>
    </div>
  );
}
