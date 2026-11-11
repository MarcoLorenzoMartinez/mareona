import type { DeviceUsageStat, AccessModeStat } from "@/lib/admin/types";

interface DeviceDonutChartProps {
  readonly devices: readonly DeviceUsageStat[];
  readonly accessModes?: readonly AccessModeStat[];
  readonly matchDayMultiplier?: number;
}

const DEVICE_STYLES: Record<string, { dot: string; stroke: string }> = {
  mobile: { dot: "bg-[#e2001a]", stroke: "#e2001a" },
  desktop: { dot: "bg-neutral-800", stroke: "#262626" },
};

/**
 * Visual card unifying device distribution (donut) and PWA mobile adoption metrics.
 */
export function DeviceDonutChart({
  devices,
  accessModes = [],
  matchDayMultiplier = 2.1,
}: DeviceDonutChartProps) {
  const mobileDevice = devices.find((d) => d.device === "mobile");
  const mobilePercent = mobileDevice?.percentage ?? 0;

  const pwaMode = accessModes.find((m) => m.mode === "pwa");
  const pwaPercent = pwaMode?.percentage ?? 0;

  const radius = 36;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const mobileArcLength = (mobilePercent / 100) * circumference;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Dispositivos y acceso</h2>
      </div>

      <div className="flex flex-1 items-center justify-center gap-7 py-4">
        {/* Donut ring */}
        <div className="shrink-0">
          <svg width="112" height="112" viewBox="0 0 90 90" className="-rotate-90">
            {/* Desktop / Base arc */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#262626"
              strokeWidth={strokeWidth}
              className="fill-transparent"
            />
            {/* Mobile / Primary arc */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#e2001a"
              strokeWidth={strokeWidth}
              strokeDasharray={`${mobileArcLength} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              className="fill-transparent transition-all duration-500"
            />
          </svg>
        </div>

        {/* Device Legend */}
        <div className="space-y-3">
          {devices.map((d) => {
            const style = DEVICE_STYLES[d.device] ?? DEVICE_STYLES.desktop;
            return (
              <div key={d.device} className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                  aria-hidden="true"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {d.label}
                    </span>
                    <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                      {d.percentage}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--muted-foreground)] tabular-nums">
                    {d.count.toLocaleString("es-ES")} visitas
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrated PWA & Matchday Footer */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground)]">App instalada (PWA):</span>
          <span className="font-bold text-[#e2001a] tabular-nums font-sans">{pwaPercent}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--muted-foreground)]">Día de partido:</span>
          <span className="font-black text-[var(--foreground)] tabular-nums font-sans">
            +{Math.round((matchDayMultiplier - 1) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
