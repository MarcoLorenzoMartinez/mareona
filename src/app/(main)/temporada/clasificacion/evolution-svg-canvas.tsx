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
 * Position (table ranking) is the primary bold red line, while points accumulation
 * is the secondary graphite dashed line.
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
  } = computeChartGeometry(evolution);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-[var(--surface)]/30 p-2 sm:p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        aria-hidden="true"
      >
        {/* Promotion & Playoff Reference Bands and Dual-Axis Scales */}
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

        {/* Points trajectory line (secondary: subtle graphite dashed line) */}
        {showPoints && (
          <path
            d={pointsLinePath}
            fill="none"
            stroke="#737373"
            strokeOpacity="0.75"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Position trajectory line (primary: bold corporate red solid line) */}
        {showPosition && (
          <path
            d={positionLinePath}
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
