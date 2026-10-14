interface MatchMomentumChartProps {
  readonly momentum: ReadonlyArray<{ readonly minute: number; readonly value: number }>;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly isHomeSporting: boolean;
  readonly homeColor: string;
  readonly awayColor: string;
}

const HALFTIME_GAP = 2;

export function MatchMomentumChart({
  momentum,
  homeTeamName,
  awayTeamName,
  isHomeSporting,
  homeColor,
  awayColor,
}: MatchMomentumChartProps) {
  if (!momentum || momentum.length === 0) return null;

  // Separar los dos tiempos según el minuto reglamentario (segunda parte arranca en min >= 46)
  const secondHalfIdx = momentum.findIndex((p, i) => i > 0 && p.minute >= 46);
  const halftimeIndex = secondHalfIdx !== -1 ? secondHalfIdx : Math.floor(momentum.length / 2);

  const getBarX = (idx: number): number => (idx < halftimeIndex ? idx + 0.5 : idx + 0.5 + HALFTIME_GAP);
  const totalWidth = momentum.length + HALFTIME_GAP;
  const halftimeX = halftimeIndex + HALFTIME_GAP / 2;
  const maxVal = Math.max(100, ...momentum.map((m) => Math.abs(m.value)));

  const getMarkerX = (targetMin: number): number => {
    const idx = momentum.findIndex((p) => p.minute >= targetMin);
    return idx !== -1 ? getBarX(idx) : targetMin;
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
          Dinámica del Partido
        </h3>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: homeColor }} />
            <span className={isHomeSporting ? "font-bold text-[var(--primary)]" : "text-[var(--foreground)]"}>
              {homeTeamName}
            </span>
          </span>
          <span className="text-[var(--foreground-muted)]">|</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: awayColor }} />
            <span className={!isHomeSporting ? "font-bold text-[var(--primary)]" : "text-[var(--foreground)]"}>
              {awayTeamName}
            </span>
          </span>
        </div>
      </div>

      {/* Canvas SVG de barras por minuto con separación fina en el descanso */}
      <div className="relative w-full pt-1">
        <svg
          viewBox={`0 0 ${totalWidth} 80`}
          className="h-24 w-full overflow-visible select-none"
          preserveAspectRatio="none"
        >
          {/* Eje central en Y=40 */}
          <line x1="0" y1="40" x2={totalWidth} y2="40" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {/* Marcadores de cuarto de hora (15', 30', 60', 75') */}
          {[15, 30, 60, 75].map((min) => {
            const x = getMarkerX(min);
            return (
              <line
                key={min}
                x1={x}
                y1={14}
                x2={x}
                y2={66}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="1.5 1.5"
                vectorEffect="non-scaling-stroke"
                opacity={0.5}
              />
            );
          })}

          {/* Línea divisoria fina de 1px para el descanso */}
          <line
            x1={halftimeX}
            y1={8}
            x2={halftimeX}
            y2={72}
            stroke="var(--foreground-muted)"
            strokeWidth="1"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Barras verticales uniformes sin solapamiento */}
          {momentum.map((point, idx) => {
            const h = (Math.abs(point.value) / maxVal) * 36;
            const isHome = point.value > 0;
            const y = isHome ? 40 - h : 40;
            const fill = isHome ? homeColor : awayColor;
            const x = getBarX(idx) - 0.425;

            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width="0.85"
                height={Math.max(h, 0.8)}
                fill={fill}
                opacity={0.85}
                rx="0.25"
              />
            );
          })}
        </svg>

        {/* Eje de tiempos alineado al píxel debajo de cada sección */}
        <div className="relative w-full h-4 text-[10px] text-[var(--foreground-muted)] font-sans font-medium tabular-nums pt-1">
          <span className="absolute left-0">0&apos;</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(getMarkerX(15) / totalWidth) * 100}%` }}>15&apos;</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(getMarkerX(30) / totalWidth) * 100}%` }}>30&apos;</span>
          <span
            className="absolute -translate-x-1/2 font-semibold text-[var(--foreground)]"
            style={{ left: `${(halftimeX / totalWidth) * 100}%` }}
          >
            Descanso
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(getMarkerX(60) / totalWidth) * 100}%` }}>60&apos;</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(getMarkerX(75) / totalWidth) * 100}%` }}>75&apos;</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(getMarkerX(90) / totalWidth) * 100}%` }}>90&apos;</span>
        </div>
      </div>
    </div>
  );
}
