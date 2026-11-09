"use client"; // Client: Controles interactivos de rango y selección de fechas

import {
  TRAFFIC_PERIODS,
  type TrafficPeriod,
} from "./traffic-period-data";

interface TrafficRangeSelectorProps {
  readonly period: TrafficPeriod;
  readonly onPeriodChange: (p: TrafficPeriod) => void;
  readonly startDate: string;
  readonly endDate: string;
  readonly onStartDateChange: (date: string) => void;
  readonly onEndDateChange: (date: string) => void;
}

/**
 * Period selector pills combined with inline custom date range inputs.
 * Strictly adheres to Mareona design: corporate red active state, rounded-full ergonomics.
 */
export function TrafficRangeSelector({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: TrafficRangeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
      {/* Pills container */}
      <div className="flex flex-wrap items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
        {TRAFFIC_PERIODS.map((p) => {
          const isSelected = period === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onPeriodChange(p.key)}
              className={`rounded-full px-3 py-1 text-xs transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#e2001a] text-white shadow-2xs font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Date picker inputs visible only when custom period is active */}
      {period === "custom" && (
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1 shadow-2xs">
          <label className="text-[11px] font-semibold text-[var(--muted-foreground)]" htmlFor="start-date-input">
            De:
          </label>
          <input
            id="start-date-input"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--foreground)] font-sans tabular-nums focus:border-[var(--primary)] focus:outline-hidden"
          />
          <span className="text-[11px] text-[var(--muted-foreground)]">a:</span>
          <input
            id="end-date-input"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--foreground)] font-sans tabular-nums focus:border-[var(--primary)] focus:outline-hidden"
          />
        </div>
      )}
    </div>
  );
}
