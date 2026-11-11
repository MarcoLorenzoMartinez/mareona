// Client: Interacción táctil, hover y selección interactiva de puntos en el gráfico
"use client";

import { useMemo, useRef, useEffect } from "react";
import type { HistoricalChartPoint } from "@/lib/historical/types";

interface EvolutionChartProps {
  readonly points: readonly HistoricalChartPoint[];
  readonly selectedSeasonId: string;
  readonly onSelectSeason: (seasonId: string) => void;
}

const WIDTH = 920;
const HEIGHT = 220;
const PAD_LEFT = 42;
const PAD_RIGHT = 24;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

/**
 * Interactive SVG trajectory chart plotting Real Sporting league finishes from 1928 to present.
 * Inverts the Y-axis so 1st place is at the top, cleanly separating 1.ª and 2.ª División.
 * Starts scrolled to the end on mobile viewports so recent seasons are immediately visible.
 */
export function HistoricalEvolutionChart({
  points,
  selectedSeasonId,
  onSelectSeason,
}: EvolutionChartProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const minYear = points[0]?.year ?? 1928;
  const maxYear = points[points.length - 1]?.year ?? 2026;
  const yearSpan = Math.max(maxYear - minYear, 1);

  // Map coordinates: Effective rank 1 to 42 (1 top, 42 bottom)
  const getX = (year: number) => PAD_LEFT + ((year - minYear) / yearSpan) * innerWidth;
  const getY = (rank: number) => PAD_TOP + ((rank - 1) / 41) * innerHeight;

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

  const polylinePoints = useMemo(() => {
    return points
      .map((p) => {
        const x = PAD_LEFT + ((p.year - minYear) / yearSpan) * innerWidth;
        const y = PAD_TOP + ((p.effectiveRank - 1) / 41) * innerHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points, minYear, yearSpan, innerWidth, innerHeight]);

  const yDiv = getY(20.5);

  return (
    <section aria-label="Evolución histórica en Liga" className="w-full">
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs">
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-none touch-pan-x">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full min-w-[700px] h-auto select-none overflow-visible"
            role="img"
            aria-label="Gráfico de posiciones históricas del Real Sporting en Primera y Segunda División"
          >
            {/* Division Background Bands */}
            <rect x={PAD_LEFT} y={PAD_TOP} width={innerWidth} height={yDiv - PAD_TOP} fill="#fafafa" />
            <rect x={PAD_LEFT} y={yDiv} width={innerWidth} height={HEIGHT - PAD_BOTTOM - yDiv} fill="#f5f5f5" />

            {/* Division Boundary Line */}
            <line x1={PAD_LEFT} y1={yDiv} x2={WIDTH - PAD_RIGHT} y2={yDiv} stroke="#d4d4d4" strokeDasharray="3 3" />

            {/* Y-Axis Boundary Line */}
            <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={HEIGHT - PAD_BOTTOM} stroke="#e5e5e5" strokeWidth="1" />

            {/* Y-Axis Division Labels (centered vertically in each division zone) */}
            <text
              x={PAD_LEFT - 8}
              y={(PAD_TOP + yDiv) / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fontWeight="bold"
              fill="#525252"
            >
              1ª
            </text>
            <text
              x={PAD_LEFT - 8}
              y={(yDiv + HEIGHT - PAD_BOTTOM) / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fontWeight="bold"
              fill="#737373"
            >
              2ª
            </text>

            {/* Trajectory Path */}
            <polyline fill="none" stroke="#e2001a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />

            {/* Interactive Points (All uniform: white with red outline) */}
            {points.map((p) => {
              const cx = getX(p.year);
              const cy = getY(p.effectiveRank);
              const isSelected = p.seasonLabel === selectedSeasonId;

              return (
                <g key={p.seasonLabel} className="cursor-pointer" onClick={() => onSelectSeason(p.seasonLabel)}>
                  <title>{`${p.seasonLabel}: ${p.position}.º puesto (${p.tier === 1 ? "1.ª" : "2.ª"})`}</title>
                  {/* Touch hit area (min 44px equivalent) */}
                  <circle cx={cx} cy={cy} r="12" fill="transparent" />

                  {/* Selected Outer Ring */}
                  {isSelected && (
                    <circle cx={cx} cy={cy} r="7" fill="none" stroke="#e2001a" strokeWidth="2" opacity="0.7" className="animate-pulse" />
                  )}

                  {/* Uniform Point Marker */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="#ffffff"
                    stroke="#e2001a"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Decade markers on X axis */}
            {[1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((yr) => (
              <text key={yr} x={getX(yr)} y={HEIGHT - 10} textAnchor="middle" fontSize="10" fill="#737373" className="tabular-nums">
                {yr}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
