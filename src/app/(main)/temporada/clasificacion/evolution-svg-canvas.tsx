import type { MatchdayEvolutionPoint } from "@/lib/sports-api/types";
import { computeChartGeometry } from "./evolution-math";
import { EvolutionChartAxes } from "./evolution-chart-axes";
import { EvolutionChartMarkers } from "./evolution-chart-markers";

interface EvolutionSvgCanvasProps {
  readonly evolution: readonly MatchdayEvolutionPoint[];
  readonly showPoints: boolean;
  readonly showPosition: boolean;
  readonly selectedPoint: MatchdayEvolutionPoint | null;
  readonly onSelectPoint: (index: number) => void;
}

/**
 * Pure SVG presentation layer for rendering points and position trajectory lines,
 * axes scales, gridlines, and interactive matchday data markers.
 */
export function EvolutionSvgCanvas({
  evolution,
  showPoints,
  showPosition,
  selectedPoint,
  onSelectPoint,
}: EvolutionSvgCanvasProps) {
  const {
    width,
    height,
    plotWidth,
    plotHeight,
    maxYPoints,
    getX,
    getYPoints,
    getYPosition,
    pointsCoords,
    positionCoords,
    pointsLinePath,
    positionLinePath,
    pointsAreaPath,
  } = computeChartGeometry(evolution);

  return (
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

        {/* Promotion & Playoff Reference Bands and Scales */}
        <EvolutionChartAxes
          plotWidth={plotWidth}
          width={width}
          maxYPoints={maxYPoints}
          showPoints={showPoints}
          showPosition={showPosition}
          getYPoints={getYPoints}
          getYPosition={getYPosition}
        />

        {/* Matchday labels on X axis */}
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

        {/* Area fill */}
        {showPoints && pointsAreaPath && (
          <path d={pointsAreaPath} fill="url(#pointsAreaGradDual)" />
        )}

        {/* Position trajectory line */}
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

        {/* Points trajectory line */}
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

        {/* Interactive marker nodes */}
        <EvolutionChartMarkers
          evolution={evolution}
          pointsCoords={pointsCoords}
          positionCoords={positionCoords}
          plotHeight={plotHeight}
          showPoints={showPoints}
          showPosition={showPosition}
          selectedMatchday={selectedPoint?.matchday}
          onSelectPoint={onSelectPoint}
        />
      </svg>
    </div>
  );
}
