interface SessionQualityCardProps {
  readonly avgSessionMinutes: number;
  readonly bounceRatePercentage: number;
  readonly pagesPerSession: number;
}

function formatMinutesAndSeconds(decimalMinutes: number): string {
  if (!decimalMinutes || decimalMinutes <= 0) return "00:00";
  const totalSeconds = Math.round(decimalMinutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Visual card displaying engagement quality metrics: session duration, bounce rate and depth.
 * Clean, flat editorial design without nested gray boxes or AI-template clutter.
 */
export function SessionQualityCard({
  avgSessionMinutes,
  bounceRatePercentage,
  pagesPerSession,
}: SessionQualityCardProps) {
  const formattedDuration = formatMinutesAndSeconds(avgSessionMinutes);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Calidad de sesión y retención</h2>
      </div>

      <div className="mt-5 grid flex-1 grid-cols-3 divide-x divide-[var(--border)] py-2">
        {/* Metric 1: Avg Duration */}
        <div className="flex flex-col justify-between pr-4">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            Tiempo medio
          </span>
          <div className="my-2">
            <span className="text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums font-sans">
              {formattedDuration}
            </span>
            <span className="ml-1 text-xs font-medium text-[var(--muted-foreground)]">min</span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            Lectura y juego
          </span>
        </div>

        {/* Metric 2: Bounce Rate */}
        <div className="flex flex-col justify-between px-4">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            Tasa de rebote
          </span>
          <div className="my-2">
            <span className="text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums font-sans">
              {bounceRatePercentage}%
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            Pantalla única
          </span>
        </div>

        {/* Metric 3: Depth */}
        <div className="flex flex-col justify-between pl-4">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            Páginas / visita
          </span>
          <div className="my-2">
            <span className="text-2xl font-black tracking-tight text-[#e2001a] tabular-nums font-sans">
              {pagesPerSession}
            </span>
            <span className="ml-1 text-xs font-medium text-[var(--muted-foreground)]">págs</span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            Profundidad media
          </span>
        </div>
      </div>
    </div>
  );
}
