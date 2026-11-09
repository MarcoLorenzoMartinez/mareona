import type { DeviceUsageStat } from "@/lib/admin/types";

interface DeviceDonutChartProps {
  readonly devices: readonly DeviceUsageStat[];
}

const DEVICE_STYLES: Record<string, { dot: string; stroke: string }> = {
  mobile: { dot: "bg-[#e2001a]", stroke: "#e2001a" },
  desktop: { dot: "bg-neutral-800", stroke: "#262626" },
};

/**
 * Donut ring visualization displaying device distribution (Mobile / PWA vs Desktop)
 * with a high-contrast charcoal secondary segment and clean side legend.
 */
export function DeviceDonutChart({ devices }: DeviceDonutChartProps) {
  const mobileDevice = devices.find((d) => d.device === "mobile");
  const mobilePercent = mobileDevice?.percentage ?? 76;

  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const mobileArcLength = (mobilePercent / 100) * circumference;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Dispositivos</h2>
      </div>

      <div className="flex flex-1 items-center justify-center gap-8 py-6">
        {/* Clean donut ring without inner text */}
        <div className="shrink-0">
          <svg width="128" height="128" viewBox="0 0 100 100" className="-rotate-90">
            {/* Desktop / Secondary arc base */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#262626"
              strokeWidth={strokeWidth}
              className="fill-transparent"
            />
            {/* Mobile / Primary arc */}
            <circle
              cx="50"
              cy="50"
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

        {/* Legend */}
        <div className="space-y-4">
          {devices.map((d) => {
            const style = DEVICE_STYLES[d.device] ?? DEVICE_STYLES.desktop;
            return (
              <div key={d.device} className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${style.dot}`}
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
    </div>
  );
}
