// Client: Permite alternar la visualización entre ambas líneas concurrentes, puntos o posición y seleccionar jornadas interactivamente
"use client";

import { useState } from "react";
import type { MatchdayEvolutionPoint } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { EvolutionSvgCanvas } from "./evolution-svg-canvas";
import { EvolutionMatchDetail } from "./evolution-match-detail";

export type DisplayMode = "both" | "points" | "position";

interface EvolutionChartProps {
  readonly evolution: readonly MatchdayEvolutionPoint[];
  readonly mode?: DisplayMode;
}

/**
 * Native, responsive SVG dual-axis line chart visualizing Real Sporting's season evolution
 * across points accumulation and table rankings simultaneously without external dependencies.
 * Complies with WCAG 2.2 AA (color + shape differentiation, high contrast, accessible table)
 * and corporate red/white visual identity.
 */
export function EvolutionChart({ evolution, mode = "both" }: EvolutionChartProps) {
  const dict = getDictionary();
  const t = dict.season.standings.evolution;
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    evolution.length > 0 ? evolution.length - 1 : null
  );

  if (evolution.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm text-[var(--foreground-muted)]">{t.empty}</p>
      </div>
    );
  }

  const latestPoint = evolution[evolution.length - 1];
  if (!latestPoint) {
    return null;
  }

  const selectedPoint =
    selectedPointIndex !== null && evolution[selectedPointIndex]
      ? evolution[selectedPointIndex]
      : latestPoint;

  const showPoints = mode === "both" || mode === "points";
  const showPosition = mode === "both" || mode === "position";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
      <EvolutionSvgCanvas
        evolution={evolution}
        showPoints={showPoints}
        showPosition={showPosition}
        selectedPoint={selectedPoint}
        onSelectPoint={setSelectedPointIndex}
      />

      {selectedPoint && <EvolutionMatchDetail point={selectedPoint} />}

      {/* Screen Reader Accessible Table (WCAG 2.2 AA) */}
      <table className="sr-only">
        <caption>{t.tableAriaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{dict.season.match.matchday}</th>
            <th scope="col">{dict.season.standings.columns.team}</th>
            <th scope="col">Resultado</th>
            <th scope="col">{dict.season.standings.columns.points}</th>
            <th scope="col">{dict.season.standings.columns.pos}</th>
          </tr>
        </thead>
        <tbody>
          {evolution.map((p) => (
            <tr key={p.matchday}>
              <td>Jornada {p.matchday}</td>
              <td>
                {p.opponent} ({p.isHome ? "Casa" : "Fuera"})
              </td>
              <td>
                {p.result === "W" ? "Victoria" : p.result === "D" ? "Empate" : "Derrota"}{" "}
                {p.score}
              </td>
              <td>{p.cumulativePoints}</td>
              <td>{p.position}.ª</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
