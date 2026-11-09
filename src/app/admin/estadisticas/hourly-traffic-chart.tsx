"use client"; // Client: Resaltado interactivo de franjas horarias

import { useState } from "react";
import type { HourlyTrafficPoint } from "@/lib/admin/types";

interface HourlyTrafficChartProps {
  readonly hours: readonly HourlyTrafficPoint[];
}

/**
 * 24-hour histogram showing user traffic concentration throughout the day.
 * Features a unified baseline and dedicated time axis below the bars.
 */
export function HourlyTrafficChart({ hours }: HourlyTrafficChartProps) {
  const [activeHour, setActiveHour] = useState<HourlyTrafficPoint | null>(null);

  if (hours.length === 0) return null;

  const maxCount = Math.max(...hours.map((h) => h.count), 1);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex h-8 items-center justify-between border-b border-[var(--border)] pb-3">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Afluencia por hora</h2>

        {activeHour && (
          <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs shadow-2xs">
            <span className="font-bold text-[var(--foreground)] tabular-nums">{activeHour.label}:</span>
            <span className="font-bold text-[var(--primary)] tabular-nums">
              {activeHour.count.toLocaleString("es-ES")} visitas
            </span>
            <span className="text-[var(--muted-foreground)] tabular-nums">({activeHour.percentage}%)</span>
          </div>
        )}
      </div>

      {/* Bars container: Clean solid baseline without chartjunk gridlines */}
      <div
        className="mt-6 flex h-32 items-end gap-1 sm:gap-1.5 border-b border-[var(--border)] pb-0.5"
        onMouseLeave={() => setActiveHour(null)}
      >
        {hours.map((h) => {
          const heightPercent = Math.max((h.count / maxCount) * 100, 6);
          const isSelected = activeHour !== null && activeHour.hour === h.hour;
          // Corporate red presence: 0.45 to 1.0 (avoids washed-out pink)
          const ratio = h.count / maxCount;
          const opacity = isSelected ? 1 : 0.45 + ratio * 0.55;

          return (
            <div
              key={h.hour}
              className="group relative flex-1 flex flex-col justify-end h-full cursor-pointer"
              onMouseEnter={() => setActiveHour(h)}
              onFocus={() => setActiveHour(h)}
              onBlur={() => setActiveHour(null)}
              tabIndex={0}
              role="button"
              aria-label={`${h.label}: ${h.count} visitas`}
            >
              <div
                style={{
                  height: `${heightPercent}%`,
                  opacity,
                }}
                className={`w-full rounded-t-xs bg-[#e2001a] transition-all duration-150 ${
                  isSelected ? "shadow-2xs ring-1 ring-[var(--primary)]" : "group-hover:opacity-100"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Athletic time axis row underneath */}
      <div className="flex items-center justify-between pt-2 px-0.5 text-[10px] text-[var(--muted-foreground)] tabular-nums">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
}
