interface EvolutionChartAxesProps {
  readonly plotWidth: number;
  readonly width: number;
  readonly maxYPoints: number;
  readonly showPoints: boolean;
  readonly showPosition: boolean;
  readonly getYPoints: (pts: number) => number;
  readonly getYPosition: (pos: number) => number;
}

/**
 * SVG background reference bands (Promotion, Playoff) and dual-axis scales
 * (Points on the left Y-axis, Table rankings on the right Y-axis).
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
  return (
    <>
      {/* Promotion & Playoff Reference Bands */}
      {showPosition && (
        <>
          <rect
            x={45}
            y={getYPosition(1)}
            width={plotWidth}
            height={getYPosition(2) - getYPosition(1) + 4}
            fill="#171717"
            fillOpacity="0.04"
            rx="2"
          />
          <rect
            x={45}
            y={getYPosition(3)}
            width={plotWidth}
            height={getYPosition(6) - getYPosition(3) + 4}
            fill="#737373"
            fillOpacity="0.05"
            rx="2"
          />
        </>
      )}

      {/* Left Y Axis (Points Scale) */}
      {showPoints &&
        [0, 5, 10, 15, 20].map((tick) => {
          if (tick > maxYPoints) return null;
          const y = getYPoints(tick);
          return (
            <g key={`pts-${tick}`}>
              <line
                x1={45}
                y1={y}
                x2={width - 45}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={37}
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
                  x1={45}
                  y1={y}
                  x2={width - 45}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              )}
              <text
                x={width - 37}
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
    </>
  );
}
