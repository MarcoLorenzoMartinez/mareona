import type { DomainMatchEvent } from "@/lib/sports-api/types";
import { MatchMomentumMarker } from "./match-momentum-marker";
import { layoutMomentumEvents } from "./momentum-event-layout";

interface MatchMomentumChartProps {
  readonly momentum: ReadonlyArray<{ readonly minute: number; readonly value: number }>;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly isHomeSporting: boolean;
  readonly homeColor: string;
  readonly awayColor: string;
  readonly events?: readonly DomainMatchEvent[];
}

const HALFTIME_GAP = 2;

export function MatchMomentumChart({
  momentum,
  homeTeamName,
  awayTeamName,
  isHomeSporting,
  homeColor,
  awayColor,
  events = [],
}: MatchMomentumChartProps) {
  if (!momentum || momentum.length === 0) return null;

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

  const keyEvents = events.filter((e) => e.type === "goal" || e.type === "redCard");
  const homeEvents = keyEvents.filter((e) => e.isHome);
  const awayEvents = keyEvents.filter((e) => !e.isHome);

  const positionedHome = layoutMomentumEvents(homeEvents, totalWidth, getMarkerX);
  const positionedAway = layoutMomentumEvents(awayEvents, totalWidth, getMarkerX);
  const allPositioned = [...positionedHome, ...positionedAway];

  const homeBandHeight = ((positionedHome.length > 0 ? Math.max(...positionedHome.map((p) => p.tier)) : 0) + 1) * 26;
  const awayBandHeight = ((positionedAway.length > 0 ? Math.max(...positionedAway.map((p) => p.tier)) : 0) + 1) * 26;

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

      <div className="relative w-full pt-1">
        {/* Banda superior de eventos: Equipo Local */}
        {positionedHome.length > 0 && (
          <div
            className="relative w-full mb-1 select-none transition-all duration-200"
            style={{ height: `${homeBandHeight}px` }}
          >
            {positionedHome.map((pe) => (
              <div
                key={pe.event.id}
                className="absolute -translate-x-1/2"
                style={{
                  left: `${pe.markerPct}%`,
                  bottom: `${pe.tier * 26}px`,
                }}
              >
                <MatchMomentumMarker event={pe.event} isTop={true} />
              </div>
            ))}
          </div>
        )}

        <svg viewBox={`0 0 ${totalWidth} 80`} className="h-24 w-full overflow-visible select-none" preserveAspectRatio="none">
          {/* Líneas guía sutiles desde el eje central (y=40) hasta el evento */}
          {allPositioned.map((pe) => {
            const isHome = pe.event.isHome;
            const strokeColor = pe.event.isSporting ? "var(--primary)" : "#525252";
            const tierOffsetUnits = pe.tier * (26 * (80 / 96));
            const y2 = isHome ? -14 - tierOffsetUnits : 94 + tierOffsetUnits;
            return (
              <line
                key={`guide-${pe.event.id}`}
                x1={pe.axisX}
                y1={40}
                x2={pe.axisX}
                y2={y2}
                stroke={strokeColor}
                strokeWidth="1"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
                opacity={0.45}
              />
            );
          })}

          <line x1="0" y1="40" x2={totalWidth} y2="40" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {[15, 30, 60, 75].map((min) => (
            <line key={min} x1={getMarkerX(min)} y1={14} x2={getMarkerX(min)} y2={66} stroke="var(--border)" strokeWidth="1" strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" opacity={0.5} />
          ))}

          <line x1={halftimeX} y1={8} x2={halftimeX} y2={72} stroke="var(--foreground-muted)" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />

          {momentum.map((point, idx) => {
            const h = (Math.abs(point.value) / maxVal) * 36;
            const isHome = point.value > 0;
            const y = isHome ? 40 - h : 40;
            const fill = isHome ? homeColor : awayColor;
            const x = getBarX(idx) - 0.425;

            return (
              <rect key={idx} x={x} y={y} width="0.85" height={Math.max(h, 0.8)} fill={fill} opacity={0.85} rx="0.25" />
            );
          })}
        </svg>

        {/* Banda inferior de eventos: Equipo Visitante */}
        {positionedAway.length > 0 && (
          <div
            className="relative w-full mt-1 select-none transition-all duration-200"
            style={{ height: `${awayBandHeight}px` }}
          >
            {positionedAway.map((pe) => (
              <div
                key={pe.event.id}
                className="absolute -translate-x-1/2"
                style={{
                  left: `${pe.markerPct}%`,
                  top: `${pe.tier * 26}px`,
                }}
              >
                <MatchMomentumMarker event={pe.event} isTop={false} />
              </div>
            ))}
          </div>
        )}

        {/* Eje de tiempos */}
        <div className="relative w-full h-4 text-[10px] text-[var(--foreground-muted)] font-sans font-medium tabular-nums pt-1">
          <span className="absolute left-0">0&apos;</span>
          {[15, 30, 60, 75, 90].map((min) => (
            <span key={min} className="absolute -translate-x-1/2" style={{ left: `${(getMarkerX(min) / totalWidth) * 100}%` }}>
              {min}&apos;
            </span>
          ))}
          <span className="absolute -translate-x-1/2 font-semibold text-[var(--foreground)]" style={{ left: `${(halftimeX / totalWidth) * 100}%` }}>
            Descanso
          </span>
        </div>
      </div>
    </div>
  );
}
