import { getDictionary } from "@/i18n";
import { CHART_DIMENSIONS } from "./evolution-math";

interface EvolutionChartAxesProps {
  readonly plotWidth: number;
  readonly width: number;
  readonly maxYPoints: number;
  readonly showPoints: boolean;
  readonly showPosition: boolean;
  readonly getYPoints: (pts: number) => number;
  readonly getYPosition: (pos: number) => number;
}

const POSITION_TICKS = [1, 6, 12, 18, 22] as const;

/**
 * Generates uniform points tick values scaled to the season progression.
 */
function getPointsTicks(maxY: number): readonly number[] {
  const step = maxY <= 25 ? 5 : maxY <= 50 ? 10 : 15;
  const ticks: number[] = [];
  for (let t = 0; t <= maxY; t += step) {
    ticks.push(t);
  }
  return ticks;
}

/**
 * SVG background reference bands and dual-axis scales.
 * Table ranking (Posición) title is centered right above the left scale numbers,
 * and accumulated points (Puntos) title is centered right above the right scale numbers.
 */
export function EvolutionChartAxes({
  plotWidth,
  width,
  maxYPoints,
  showPoints,
  showPosition,
  getYPoints,
  getYPosition,
}: EvolutionChartAxesProps) {
  const dict = getDictionary();
  const t = dict.season.standings.evolution;
  const pointsTicks = getPointsTicks(maxYPoints);

  const { paddingLeft, paddingRight } = CHART_DIMENSIONS;
  const rightEdge = width - paddingRight;
  const leftCenter = paddingLeft / 2;
  const rightCenter = width - paddingRight / 2;

  return (
    <>
      {/* Promotion & Playoff Reference Bands */}
      {showPosition && (
        <>
          <rect
            x={paddingLeft}
            y={getYPosition(1)}
            width={plotWidth}
            height={getYPosition(2) - getYPosition(1) + 4}
            fill="#171717"
            fillOpacity="0.04"
            rx="2"
          />
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

      {/* Left Y Axis Title & Scale (Primary: Posición) */}
      {showPosition && (
        <g>
          <text
            x={leftCenter}
            y={20}
            textAnchor="middle"
            fontSize="9"
            fill="var(--primary)"
            fontWeight="700"
            className="uppercase tracking-wider select-none"
          >
            {t.axisPosition}
          </text>

          {POSITION_TICKS.map((pos) => {
            const y = getYPosition(pos);
            return (
              <g key={`pos-${pos}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={rightEdge}
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
                  {pos}.º
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Right Y Axis Title & Scale (Secondary: Puntos) */}
      {showPoints && (
        <g>
          <text
            x={rightCenter}
            y={20}
            textAnchor="middle"
            fontSize="9"
            fill="var(--foreground-muted)"
            fontWeight="700"
            className="uppercase tracking-wider select-none"
          >
            {t.axisPoints}
          </text>

          {pointsTicks.map((tick) => {
            const y = getYPoints(tick);
            return (
              <g key={`pts-${tick}`}>
                {!showPosition && (
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={rightEdge}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}
                <text
                  x={rightEdge + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  fontSize="9.5"
                  fill="var(--foreground-muted)"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </>
  );
}
