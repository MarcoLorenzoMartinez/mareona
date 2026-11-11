import type { AccessModeStat } from "@/lib/admin/types";

interface AppAdoptionCardProps {
  readonly accessModes: readonly AccessModeStat[];
  readonly matchDayMultiplier: number;
}

const ACCESS_STYLES: Record<string, { dot: string; stroke: string }> = {
  pwa: { dot: "bg-[#e2001a]", stroke: "#e2001a" },
  browser: { dot: "bg-neutral-800", stroke: "#262626" },
};

/**
 * Visual card displaying PWA adoption with a circular donut ring
 * and matchday multiplier without explanatory prose.
 */
export function AppAdoptionCard({ accessModes, matchDayMultiplier }: AppAdoptionCardProps) {
  const pwaMode = accessModes.find((m) => m.mode === "pwa");
  const pwaPercent = pwaMode?.percentage ?? 0;

  const radius = 32;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const pwaArcLength = (pwaPercent / 100) * circumference;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Adopción de la app y jornada</h2>
      </div>

      {/* Circular Donut Visualization */}
      <div className="flex flex-1 items-center justify-center gap-7 py-3">
        <div className="shrink-0">
          <svg width="96" height="96" viewBox="0 0 80 80" className="-rotate-90">
            {/* Browser base arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#262626"
              strokeWidth={strokeWidth}
              className="fill-transparent"
            />
            {/* PWA arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e2001a"
              strokeWidth={strokeWidth}
              strokeDasharray={`${pwaArcLength} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              className="fill-transparent transition-all duration-500"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {accessModes.map((m) => {
            const style = ACCESS_STYLES[m.mode] ?? ACCESS_STYLES.browser;
            return (
              <div key={m.mode} className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                  aria-hidden="true"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {m.label}
                    </span>
                    <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                      {m.percentage}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--muted-foreground)] tabular-nums">
                    {m.count.toLocaleString("es-ES")} accesos
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matchday boost row without redundant prose */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
        <span className="font-semibold text-[var(--foreground)]">
          Multiplicador en día de partido
        </span>
        <span className="text-xl font-black tracking-tight text-[#e2001a] tabular-nums font-sans">
          +{Math.round((matchDayMultiplier - 1) * 100)}%
        </span>
      </div>
    </div>
  );
}
