// Client: Interacción táctil, hover y selección por punto más cercano en el gráfico
"use client";

import { useMemo, useRef, useEffect, useState, useCallback, type MouseEvent, type PointerEvent } from "react";
import type { HistoricalChartPoint } from "@/lib/historical/types";
import {
  CHART_HEIGHT,
  CHART_INNER_WIDTH,
  CHART_PAD_BOTTOM,
  CHART_PAD_LEFT,
  CHART_PAD_RIGHT,
  CHART_PAD_TOP,
  CHART_WIDTH,
  clientToSvgCoords,
  computeChartPointCoords,
  findNearestChartPoint,
  getChartRankY,
  getChartYearX,
  type ChartPointCoord,
} from "./evolution-chart-math";

interface EvolutionChartProps {
  readonly points: readonly HistoricalChartPoint[];
  readonly selectedSeasonId: string;
  readonly onSelectSeason: (seasonId: string) => void;
}

const DECADE_MARKERS = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;

/**
 * Interactive SVG trajectory chart plotting Real Sporting league finishes from 1928 to present.
 * Resolves clicks and pointer hover to the nearest 2D point so adjacent seasons never steal clicks.
 */
export function HistoricalEvolutionChart({
  points,
  selectedSeasonId,
  onSelectSeason,
}: EvolutionChartProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSeasonId, setHoveredSeasonId] = useState<string | null>(null);

  const minYear = points[0]?.year ?? 1928;
  const maxYear = points[points.length - 1]?.year ?? 2026;
  const yearSpan = Math.max(maxYear - minYear, 1);

  // On mount, position the horizontal scroll at the rightmost end so the most recent seasons are visible first
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollToRecent = () => {
      el.scrollLeft = el.scrollWidth;
    };

    scrollToRecent();
    const frameId = requestAnimationFrame(scrollToRecent);

    return () => cancelAnimationFrame(frameId);
  }, []);

  const pointCoords = useMemo(() => computeChartPointCoords(points), [points]);

  const polylinePoints = useMemo(() => {
    return pointCoords.map((c) => `${c.cx.toFixed(1)},${c.cy.toFixed(1)}`).join(" ");
  }, [pointCoords]);

  const resolveNearestPoint = useCallback(
    (clientX: number, clientY: number): ChartPointCoord | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const svgPos = clientToSvgCoords(clientX, clientY, svg.getBoundingClientRect());
      if (!svgPos) return null;
      return findNearestChartPoint(pointCoords, svgPos.x, svgPos.y);
    },
    [pointCoords]
  );

  const handleSvgClick = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      const nearest = resolveNearestPoint(e.clientX, e.clientY);
      if (nearest) {
        onSelectSeason(nearest.point.seasonLabel);
      }
    },
    [resolveNearestPoint, onSelectSeason]
  );

  const handleSvgPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (e.pointerType === "touch") return;
      const nearest = resolveNearestPoint(e.clientX, e.clientY);
      setHoveredSeasonId(nearest?.point.seasonLabel ?? null);
    },
    [resolveNearestPoint]
  );

  const handleSvgPointerLeave = useCallback(() => {
    setHoveredSeasonId(null);
  }, []);

  const hoveredPoint = useMemo(
    () => (hoveredSeasonId ? pointCoords.find((c) => c.point.seasonLabel === hoveredSeasonId) ?? null : null),
    [pointCoords, hoveredSeasonId]
  );

  const yDiv = getChartRankY(20.5);

  return (
    <section aria-label="Evolución histórica en Liga" className="w-full">
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs">
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-none touch-pan-x">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className={`w-full min-w-[700px] h-auto select-none overflow-visible ${hoveredPoint ? "cursor-pointer" : ""}`}
            role="img"
            aria-label="Gráfico de posiciones históricas del Real Sporting en Primera y Segunda División"
            onClick={handleSvgClick}
            onPointerMove={handleSvgPointerMove}
            onPointerLeave={handleSvgPointerLeave}
          >
            {/* Division Background Bands */}
            <rect x={CHART_PAD_LEFT} y={CHART_PAD_TOP} width={CHART_INNER_WIDTH} height={yDiv - CHART_PAD_TOP} fill="#fafafa" />
            <rect x={CHART_PAD_LEFT} y={yDiv} width={CHART_INNER_WIDTH} height={CHART_HEIGHT - CHART_PAD_BOTTOM - yDiv} fill="#f5f5f5" />

            {/* Division Boundary Line */}
            <line x1={CHART_PAD_LEFT} y1={yDiv} x2={CHART_WIDTH - CHART_PAD_RIGHT} y2={yDiv} stroke="#d4d4d4" strokeDasharray="3 3" />

            {/* Y-Axis Boundary Line */}
            <line x1={CHART_PAD_LEFT} y1={CHART_PAD_TOP} x2={CHART_PAD_LEFT} y2={CHART_HEIGHT - CHART_PAD_BOTTOM} stroke="#e5e5e5" strokeWidth="1" />

            {/* Y-Axis Division Labels (centered vertically in each division zone) */}
            <text x={CHART_PAD_LEFT - 8} y={(CHART_PAD_TOP + yDiv) / 2 + 4} textAnchor="end" fontSize="12" fontWeight="bold" fill="#525252">
              1ª
            </text>
            <text x={CHART_PAD_LEFT - 8} y={(yDiv + CHART_HEIGHT - CHART_PAD_BOTTOM) / 2 + 4} textAnchor="end" fontSize="12" fontWeight="bold" fill="#737373">
              2ª
            </text>

            {/* Trajectory Path */}
            <polyline fill="none" stroke="#e2001a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />

            {/* Plotted Season Points */}
            {pointCoords.map(({ point, cx, cy }) => {
              const isSelected = point.seasonLabel === selectedSeasonId;
              const isHovered = point.seasonLabel === hoveredSeasonId && !isSelected;

              return (
                <g key={point.seasonLabel} className="pointer-events-none">
                  {isHovered && (
                    <circle cx={cx} cy={cy} r="5.5" fill="none" stroke="#e2001a" strokeWidth="1.5" opacity="0.45" />
                  )}
                  {isSelected && (
                    <circle cx={cx} cy={cy} r="7" fill="none" stroke="#e2001a" strokeWidth="2" opacity="0.7" className="animate-pulse" />
                  )}
                  <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" stroke="#e2001a" strokeWidth="1.5" />
                </g>
              );
            })}

            {/* Native tooltip anchored to the nearest hovered point */}
            {hoveredPoint && (
              <circle cx={hoveredPoint.cx} cy={hoveredPoint.cy} r="8" fill="transparent">
                <title>{`${hoveredPoint.point.seasonLabel}: ${hoveredPoint.point.position}.º puesto (${hoveredPoint.point.tier === 1 ? "1.ª" : "2.ª"})`}</title>
              </circle>
            )}

            {/* Decade markers on X axis */}
            {DECADE_MARKERS.map((yr) => (
              <text
                key={yr}
                x={getChartYearX(yr, minYear, yearSpan)}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#737373"
                className="tabular-nums pointer-events-none"
              >
                {yr}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
