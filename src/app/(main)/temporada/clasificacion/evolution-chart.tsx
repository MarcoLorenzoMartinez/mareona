// Client: Permite alternar la visualización entre ambas líneas concurrentes, puntos o posición y seleccionar jornadas interactivamente
"use client";

import { useState } from "react";
import type { MatchdayEvolutionPoint } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getDictionary } from "@/i18n";

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

  // SVG Dimensions & Padding (dual-axis needs left and right gutter)
  const width = 660;
  const height = 270;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 35;
  const paddingBottom = 40;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Max Points calculation for Y scale
  const maxCumulativePoints = Math.max(
    ...evolution.map((p) => p.cumulativePoints),
    18
  );
  // Round up to multiple of 5 for clean Y axis ticks
  const maxYPoints = Math.ceil(maxCumulativePoints / 5) * 5;

  // X coordinate helper
  const getX = (index: number): number => {
    if (evolution.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (evolution.length - 1)) * plotWidth;
  };

  // Left Y axis for Points (0 at bottom, maxYPoints at top)
  const getYPoints = (pts: number): number => {
    return paddingTop + plotHeight - (pts / maxYPoints) * plotHeight;
  };

  // Right Y axis for Position (Rank 1 at top, Rank 22 at bottom)
  const getYPosition = (pos: number): number => {
    const clamped = Math.max(1, Math.min(22, pos));
    return paddingTop + ((clamped - 1) / 21) * plotHeight;
  };

  // Path coordinates
  const pointsCoords = evolution.map((p, i) => ({
    x: getX(i),
    y: getYPoints(p.cumulativePoints),
  }));

  const positionCoords = evolution.map((p, i) => ({
    x: getX(i),
    y: getYPosition(p.position),
  }));

  // Build SVG path commands
  const pointsLinePath = pointsCoords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(" ");

  const positionLinePath = positionCoords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(" ");

  const firstPointCoord = pointsCoords[0];
  const lastPointCoord = pointsCoords[pointsCoords.length - 1];
  const pointsAreaPath =
    firstPointCoord && lastPointCoord
      ? `${pointsLinePath} L ${lastPointCoord.x} ${
          paddingTop + plotHeight
        } L ${firstPointCoord.x} ${paddingTop + plotHeight} Z`
      : "";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">

      {/* SVG Dual-Axis Chart Container */}
      <div className="relative w-full overflow-hidden rounded-lg bg-[var(--surface)]/30 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pointsAreaGradDual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2001a" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#e2001a" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Reference Background Bands (Shown when position is active) */}
          {showPosition && (
            <>
              {/* Direct Promotion Zone (1 to 2) */}
              <rect
                x={paddingLeft}
                y={getYPosition(1)}
                width={plotWidth}
                height={getYPosition(2) - getYPosition(1) + 4}
                fill="#171717"
                fillOpacity="0.04"
                rx="2"
              />
              {/* Playoff Zone (3 to 6) */}
              <rect
                x={paddingLeft}
                y={getYPosition(3)}
                width={plotWidth}
                height={getYPosition(6) - getYPosition(3) + 4}
                fill="#737373"
                fillOpacity="0.05"
                rx="2"
              />
            </>
          )}

          {/* Left Y Axis (Points Scale & Gridlines) */}
          {showPoints &&
            [0, 5, 10, 15, 20].map((tick) => {
              if (tick > maxYPoints) return null;
              const y = getYPoints(tick);
              return (
                <g key={`pts-${tick}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--primary)"
                    fontWeight="700"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

          {/* Right Y Axis (Position Scale) */}
          {showPosition &&
            [1, 6, 12, 18, 22].map((pos) => {
              const y = getYPosition(pos);
              return (
                <g key={`pos-${pos}`}>
                  {!showPoints && (
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  )}
                  <text
                    x={width - paddingRight + 8}
                    y={y + 3.5}
                    textAnchor="start"
                    fontSize="9.5"
                    fill="var(--foreground-muted)"
                    fontWeight="500"
                  >
                    {pos}.º
                  </text>
                </g>
              );
            })}

          {/* X Axis Labels (Matchdays) */}
          {evolution.map((p, i) => {
            const x = getX(i);
            const isSelected = selectedPoint?.matchday === p.matchday;
            return (
              <text
                key={p.matchday}
                x={x}
                y={height - 12}
                textAnchor="middle"
                fontSize={isSelected ? "11" : "10"}
                fontWeight={isSelected ? "800" : "500"}
                fill={isSelected ? "var(--primary)" : "var(--foreground-muted)"}
              >
                J{p.matchday}
              </text>
            );
          })}

          {/* 1. Points Area Gradient Fill */}
          {showPoints && pointsAreaPath && (
            <path d={pointsAreaPath} fill="url(#pointsAreaGradDual)" />
          )}

          {/* 2. Position Trajectory Line (Subtle neutral dashed line) */}
          {showPosition && (
            <path
              d={positionLinePath}
              fill="none"
              stroke="#737373"
              strokeOpacity="0.65"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 3. Points Trajectory Line (Red solid line) */}
          {showPoints && (
            <path
              d={pointsLinePath}
              fill="none"
              stroke="#e2001a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 4. Interactive Data Point Markers */}
          {evolution.map((p, i) => {
            const isSelected = selectedPoint?.matchday === p.matchday;
            const ptsCoord = pointsCoords[i];
            const posCoord = positionCoords[i];
            if (!ptsCoord || !posCoord) return null;

            return (
              <g
                key={p.matchday}
                className="cursor-pointer focus:outline-none"
                onClick={() => setSelectedPointIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedPointIndex(i);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Jornada ${p.matchday}: ${p.cumulativePoints} puntos, Posición ${
                  p.position
                }. ${p.result === "W" ? "Victoria" : p.result === "D" ? "Empate" : "Derrota"} ${
                  p.score
                } vs ${p.opponent}`}
              >
                {/* Vertical Cursor Indicator when active */}
                {isSelected && (
                  <line
                    x1={ptsCoord.x}
                    y1={paddingTop}
                    x2={ptsCoord.x}
                    y2={paddingTop + plotHeight}
                    stroke="var(--border)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Position Marker: Subtle small square */}
                {showPosition && (
                  <rect
                    x={posCoord.x - (isSelected ? 3.5 : 2.5)}
                    y={posCoord.y - (isSelected ? 3.5 : 2.5)}
                    width={isSelected ? 7 : 5}
                    height={isSelected ? 7 : 5}
                    rx="1"
                    fill="#ffffff"
                    stroke="#737373"
                    strokeWidth={isSelected ? "1.8" : "1.2"}
                  />
                )}

                {/* Points Marker: Circle */}
                {showPoints && (
                  <>
                    {isSelected && (
                      <circle
                        cx={ptsCoord.x}
                        cy={ptsCoord.y}
                        r="8.5"
                        fill="none"
                        stroke="#e2001a"
                        strokeWidth="2"
                        strokeOpacity="0.35"
                      />
                    )}
                    <circle
                      cx={ptsCoord.x}
                      cy={ptsCoord.y}
                      r={isSelected ? "5.5" : "4"}
                      fill="#ffffff"
                      stroke="#e2001a"
                      strokeWidth={isSelected ? "3" : "2"}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Point Detail Card */}
      {selectedPoint && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-[var(--foreground)]">
              {t.matchdayPrefix} {selectedPoint.matchday}
            </span>

            {/* Marcador con escudos de ambos equipos */}
            <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
              {/* Equipo Local */}
              <div className="flex items-center gap-1.5">
                <TeamCrest
                  crestUrl={selectedPoint.homeCrestUrl}
                  teamName={selectedPoint.homeTeamName}
                  size="sm"
                  isSporting={selectedPoint.isHome}
                />
                <span
                  className={`text-xs ${
                    selectedPoint.isHome
                      ? "font-bold text-[var(--foreground)]"
                      : "text-[var(--foreground-muted)]"
                  }`}
                >
                  {selectedPoint.homeTeamName}
                </span>
              </div>

              {/* Marcador */}
              <span className="rounded-xs bg-white px-1.5 py-0.5 font-mono text-xs font-black tabular-nums border border-[var(--border)] text-[var(--foreground)]">
                {selectedPoint.homeScore} - {selectedPoint.awayScore}
              </span>

              {/* Equipo Visitante */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs ${
                    !selectedPoint.isHome
                      ? "font-bold text-[var(--foreground)]"
                      : "text-[var(--foreground-muted)]"
                  }`}
                >
                  {selectedPoint.awayTeamName}
                </span>
                <TeamCrest
                  crestUrl={selectedPoint.awayCrestUrl}
                  teamName={selectedPoint.awayTeamName}
                  size="sm"
                  isSporting={!selectedPoint.isHome}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 text-[var(--foreground)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
              <strong>{selectedPoint.cumulativePoints}</strong> {dict.season.standings.columns.points}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
              <span className="h-1.5 w-1.5 rounded-xs border border-neutral-400 bg-white" aria-hidden="true" />
              <strong className="text-[var(--foreground)]">{selectedPoint.position}.ª</strong> {dict.season.standings.columns.pos}
            </span>
          </div>
        </div>
      )}

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
