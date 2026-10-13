import type { MatchdayEvolutionPoint } from "@/lib/sports-api/types";

interface EvolutionChartMarkersProps {
  readonly evolution: readonly MatchdayEvolutionPoint[];
  readonly pointsCoords: readonly { x: number; y: number }[];
  readonly positionCoords: readonly { x: number; y: number }[];
  readonly plotHeight: number;
  readonly showPoints: boolean;
  readonly showPosition: boolean;
  readonly selectedMatchday?: number;
  readonly onSelectPoint: (index: number) => void;
}

/**
 * Interactive SVG node markers for data points on the evolution timeline,
 * supporting keyboard navigation, focus management, and selection states.
 */
export function EvolutionChartMarkers({
  evolution,
  pointsCoords,
  positionCoords,
  plotHeight,
  showPoints,
  showPosition,
  selectedMatchday,
  onSelectPoint,
}: EvolutionChartMarkersProps) {
  return (
    <>
      {evolution.map((p, i) => {
        const isSelected = selectedMatchday === p.matchday;
        const ptsCoord = pointsCoords[i];
        const posCoord = positionCoords[i];
        if (!ptsCoord || !posCoord) return null;

        return (
          <g
            key={p.matchday}
            className="cursor-pointer focus:outline-none"
            onClick={() => onSelectPoint(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelectPoint(i);
            }}
            tabIndex={0}
            role="button"
            aria-label={`Jornada ${p.matchday}: ${p.cumulativePoints} pts, ${p.position}.ª`}
          >
            {isSelected && (
              <line
                x1={ptsCoord.x}
                y1={35}
                x2={ptsCoord.x}
                y2={35 + plotHeight}
                stroke="var(--border)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}
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
    </>
  );
}
