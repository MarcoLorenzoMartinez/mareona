"use client"; // Client: Interactividad, cambio de periodo y hover sobre puntos diarios

import { useState } from "react";
import type { DailyTrafficPoint } from "@/lib/admin/types";
import {
  type TrafficPeriod,
  getPointsForPeriod,
  shouldShowLabel,
} from "./traffic-period-data";
import { TrafficRangeSelector } from "./traffic-range-selector";

interface TrafficAreaChartProps {
  readonly points: readonly DailyTrafficPoint[];
  readonly allDailyPoints?: readonly DailyTrafficPoint[];
}

/**
 * Responsive SVG area chart showing daily/monthly traffic with explicit point markers,
 * refined match-day subtle accents, and calendar date range selection.
 */
export function TrafficAreaChart({ points, allDailyPoints }: TrafficAreaChartProps) {
  const defaultStart = points[0]?.date ?? new Date().toISOString().split("T")[0];
  const defaultEnd = points[points.length - 1]?.date ?? new Date().toISOString().split("T")[0];
  const [period, setPeriod] = useState<TrafficPeriod>("14d");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentPoints = getPointsForPeriod(points, period, startDate, endDate, allDailyPoints);
  if (currentPoints.length === 0) return null;

  const totalVisits = currentPoints.reduce((acc, p) => acc + p.visits, 0);
  const totalUniques = currentPoints.reduce((acc, p) => acc + p.uniqueVisitors, 0);
  const maxVisits = Math.max(...currentPoints.map((p) => p.visits), 100);

  const width = 640;
  const height = 180;
  const padX = 24;
  const padTop = 20;
  const chartHeight = 130;
  const chartWidth = 592;

  const coords = currentPoints.map((p, i) => ({
    x: padX + (i / Math.max(currentPoints.length - 1, 1)) * chartWidth,
    y: padTop + chartHeight - (p.visits / maxVisits) * chartHeight,
    point: p,
  }));

  const linePath = coords.reduce(
    (acc, curr, i) => `${acc} ${i === 0 ? "M" : "L"} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`,
    ""
  );
  const lastX = coords[coords.length - 1]?.x.toFixed(1) ?? "0";
  const firstX = coords[0]?.x.toFixed(1) ?? "0";
  const areaPath = `${linePath} L ${lastX} 150 L ${firstX} 150 Z`;

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex h-7 items-center gap-3">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Visitas</h2>
            {activePoint && (
              <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-0.5 text-xs shadow-2xs">
                <span className="font-bold text-[var(--foreground)] tabular-nums">
                  {activePoint.point.label}:
                </span>
                <span className="font-bold text-[var(--primary)] tabular-nums">
                  {activePoint.point.visits.toLocaleString("es-ES")} visitas
                </span>
              </div>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums">
              {totalVisits.toLocaleString("es-ES")}
            </span>
            <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
              {totalUniques.toLocaleString("es-ES")} visitantes únicos
            </span>
          </div>
        </div>

        <TrafficRangeSelector
          period={period}
          onPeriodChange={(p) => { setPeriod(p); setHoveredIndex(null); }}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(d) => { setStartDate(d); setHoveredIndex(null); }}
          onEndDateChange={(d) => { setEndDate(d); setHoveredIndex(null); }}
        />
      </div>

      <div
        className="mt-4 relative w-full overflow-hidden"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Gráfico de evolución de visitas"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2001a" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#e2001a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference gridlines */}
          {[0, 0.5, 1].map((pct) => (
            <line
              key={pct}
              x1={padX}
              y1={padTop + chartHeight * (1 - pct)}
              x2={width - padX}
              y2={padTop + chartHeight * (1 - pct)}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}

          <path d={areaPath} fill="url(#trafficGradient)" />
          <path d={linePath} fill="none" stroke="#e2001a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Point markers: harmonized size with subtle distinction for match days */}
          {coords.map((c, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={c.point.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onFocus={() => setHoveredIndex(i)}
                tabIndex={0}
                role="button"
                aria-label={`${c.point.label}: ${c.point.visits} visitas`}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 4.5 : 3.25}
                  fill={c.point.isMatchDay ? "#e2001a" : "#ffffff"}
                  stroke={c.point.isMatchDay ? "#ffffff" : "#e2001a"}
                  strokeWidth={c.point.isMatchDay ? 1.5 : 2}
                  className="transition-transform duration-150"
                />
                <rect x={c.x - 10} y={padTop} width="20" height={chartHeight} fill="transparent" />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {coords.map((c, i) => {
            if (!shouldShowLabel(period, i, coords.length)) return null;
            return (
              <text
                key={c.point.date}
                x={c.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-[var(--muted-foreground)] text-[10px] font-medium"
              >
                {c.point.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
