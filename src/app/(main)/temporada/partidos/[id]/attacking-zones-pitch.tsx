interface AttackingZonesPitchProps {
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly homeColor: string;
  readonly awayColor: string;
  readonly homeZones: { readonly left: number; readonly center: number; readonly right: number };
  readonly awayZones: { readonly left: number; readonly center: number; readonly right: number };
}

interface SingleTeamPitchProps {
  readonly teamName: string;
  readonly color: string;
  readonly zones: { readonly left: number; readonly center: number; readonly right: number };
}

function SingleTeamPitch({ teamName, color, zones }: SingleTeamPitchProps) {
  const lanes = [
    { id: "left", label: "Izq.", pct: zones.left, x: 0, textX: 11.33 },
    { id: "center", label: "Centro", pct: zones.center, x: 22.67, textX: 34 },
    { id: "right", label: "Der.", pct: zones.right, x: 45.33, textX: 56.67 },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--foreground)] truncate">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
        <span className="truncate">{teamName}</span>
      </div>

      <div className="relative w-full">
        <svg viewBox="0 0 68 50" className="w-full rounded-lg bg-emerald-900 shadow-inner" aria-label={`Zonas de ataque de ${teamName}`}>
          {/* Sombreado de intensidad por cada carril ofensivo */}
          {lanes.map((lane) => {
            const intensity = Math.max(0.12, Math.min(0.65, (lane.pct / 100) * 0.75 + 0.1));
            return (
              <rect
                key={lane.id}
                x={lane.x}
                y="0"
                width="22.67"
                height="50"
                fill={color}
                opacity={intensity}
              />
            );
          })}

          {/* Marcas reglamentarias del medio campo de ataque */}
          <rect x="0" y="0" width="68" height="50" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.6" />
          <rect x="30.34" y="0" width="7.32" height="1.2" fill="#ffffff" opacity="0.85" />
          <rect x="24.84" y="0" width="18.32" height="4.5" fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.6" />
          <rect x="13.84" y="0" width="40.32" height="15" fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.6" />
          <circle cx="34" cy="9.5" r="0.5" fill="#ffffff" opacity="0.75" />
          <path d="M 27.5 15 A 8 8 0 0 0 40.5 15" fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.6" />

          {/* Separadores discontinuos de los 3 carriles */}
          <line x1="22.67" y1="0" x2="22.67" y2="50" stroke="#ffffff" strokeWidth="0.35" strokeDasharray="1.5,1.5" opacity="0.5" />
          <line x1="45.33" y1="0" x2="45.33" y2="50" stroke="#ffffff" strokeWidth="0.35" strokeDasharray="1.5,1.5" opacity="0.5" />

          {/* Etiquetas y porcentajes sobre cada zona del campo */}
          {lanes.map((lane) => (
            <g key={`text-${lane.id}`}>
              <text
                x={lane.textX}
                y="30"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="4.8"
                fontWeight="bold"
                className="font-sans tabular-nums select-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
              >
                {lane.pct}%
              </text>
              <text
                x={lane.textX}
                y="38"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="2.6"
                fontWeight="500"
                opacity="0.85"
                className="select-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
              >
                {lane.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function AttackingZonesPitch({
  homeTeamName,
  awayTeamName,
  homeColor,
  awayColor,
  homeZones,
  awayZones,
}: AttackingZonesPitchProps) {
  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border)]/40">
      <div className="text-[11px] font-medium text-[var(--foreground-muted)]">
        Zonas de Ataque
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <SingleTeamPitch teamName={homeTeamName} color={homeColor} zones={homeZones} />
        <SingleTeamPitch teamName={awayTeamName} color={awayColor} zones={awayZones} />
      </div>
    </div>
  );
}
