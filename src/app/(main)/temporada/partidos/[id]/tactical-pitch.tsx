import type { DomainLineupPlayer } from "@/lib/sports-api/types";

interface TacticalPitchProps {
  readonly formation: string;
  readonly starters: readonly DomainLineupPlayer[];
  readonly isSporting: boolean;
  readonly teamName: string;
}

interface PitchPosition {
  readonly x: number;
  readonly y: number;
}

/**
 * Calculates responsive tactical grid coordinates for any soccer formation string (e.g. 4-2-3-1).
 */
function calculateFormationCoordinates(
  formation: string,
  totalStarters: number
): PitchPosition[] {
  const parts = formation.split("-").map((n) => parseInt(n.trim(), 10)).filter((n) => !Number.isNaN(n) && n > 0);
  const lines = parts.length > 0 ? [1, ...parts] : [1, 4, 4, 2];
  const totalSlots = lines.reduce((acc, curr) => acc + curr, 0);

  // Fallback to standard 4-4-2 if line sums don't match or invalid
  const activeLines = totalSlots === totalStarters ? lines : [1, 4, 4, 2];
  const lineCount = activeLines.length;
  const positions: PitchPosition[] = [];

  activeLines.forEach((count, lineIdx) => {
    const y = 88 - (lineIdx * (88 - 16)) / Math.max(1, lineCount - 1);
    for (let col = 0; col < count; col++) {
      const x = ((col + 1) / (count + 1)) * 100;
      positions.push({ x, y });
    }
  });

  return positions;
}

/**
 * SVG tactical pitch rendering 11 starters in accurate spatial formation.
 */
export function TacticalPitch({
  formation,
  starters,
  isSporting,
  teamName,
}: TacticalPitchProps) {
  // Sort starters: GK first, then by formationPlace or position
  const sorted = [...starters].sort((a, b) => {
    if (a.position === "goalkeeper" && b.position !== "goalkeeper") return -1;
    if (b.position === "goalkeeper" && a.position !== "goalkeeper") return 1;
    if (a.formationPlace !== null && b.formationPlace !== null) {
      return a.formationPlace - b.formationPlace;
    }
    return (a.jersey ?? 99) - (b.jersey ?? 99);
  });

  const positions = calculateFormationCoordinates(formation, sorted.length);

  return (
    <div
      role="region"
      aria-label={`Pizarra táctica de ${teamName} con esquema ${formation}`}
      className="relative w-full aspect-[4/5] max-w-lg mx-auto overflow-hidden rounded-xl bg-[#143d2b] shadow-inner select-none border border-emerald-900/60"
    >
      {/* Marcado SVG del campo de fútbol */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none stroke-white/25"
        strokeWidth="1.5"
        fill="none"
        viewBox="0 0 100 125"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Línea exterior */}
        <rect x="4" y="4" width="92" height="117" rx="1" />
        {/* Línea de medio campo */}
        <line x1="4" y1="62.5" x2="96" y2="62.5" />
        {/* Círculo central */}
        <circle cx="50" cy="62.5" r="14" />
        <circle cx="50" cy="62.5" r="0.8" fill="rgba(255,255,255,0.4)" />
        {/* Área grande rival (arriba) */}
        <rect x="22" y="4" width="56" height="19" />
        <rect x="35" y="4" width="30" height="7" />
        {/* Área grande propia (abajo) */}
        <rect x="22" y="102" width="56" height="19" />
        <rect x="35" y="114" width="30" height="7" />
        {/* Punto de penalti propio */}
        <circle cx="50" cy="110" r="0.8" fill="rgba(255,255,255,0.4)" />
      </svg>

      {/* Jugadores sobre el campo */}
      {sorted.map((player, idx) => {
        const pos = positions[idx] ?? { x: 50, y: 50 };
        return (
          <div
            key={player.id || idx}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-default"
          >
            {/* Círculo con dorsal */}
            <div
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-black shadow-md transition-transform group-hover:scale-110 ${
                isSporting
                  ? "bg-[#e2001a] border-white text-white"
                  : "bg-slate-900 border-white/90 text-white"
              }`}
            >
              {player.jersey ?? "-"}
            </div>
            {/* Nombre del jugador */}
            <span className="mt-1 max-w-[85px] sm:max-w-[105px] truncate rounded bg-black/75 px-1.5 py-0.5 text-center text-[10px] sm:text-[11px] font-semibold text-white tracking-tight backdrop-blur-xs">
              {player.shortName || player.name}
            </span>
          </div>
        );
      })}

      {/* Esquema táctico superpuesto en la esquina */}
      <div className="absolute bottom-2.5 right-3 rounded bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white/90 backdrop-blur-xs">
        {formation}
      </div>
    </div>
  );
}
