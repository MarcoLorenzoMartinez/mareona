interface CardStatsHudProps {
  readonly knownAs: string;
  readonly matchesPlayed: number;
  readonly defensePower: number;
  readonly attackPower: number;
  readonly ovr: number;
  readonly isOwned: boolean;
}

/**
 * Calculates adaptive font size and tracking based on text length
 * to ensure player names fit cleanly in the plate without ever clipping or showing ellipsis.
 */
function getAdaptiveNameStyle(name: string): string {
  const len = name.length;
  if (len <= 9) {
    return "text-xs sm:text-sm tracking-wider";
  }
  if (len <= 13) {
    return "text-[10.5px] sm:text-xs tracking-normal";
  }
  if (len <= 16) {
    return "text-[9.5px] sm:text-[11px] tracking-tight";
  }
  return "text-[8.5px] sm:text-[9.5px] tracking-tighter";
}

/**
 * Heritage-style nameplate and stats panel for classic trading cards.
 * Combines an engraved player plate with four precision metric boxes.
 */
export function CardStatsHud({
  knownAs,
  matchesPlayed,
  defensePower,
  attackPower,
  ovr,
  isOwned,
}: CardStatsHudProps) {
  const nameStyle = getAdaptiveNameStyle(knownAs);

  return (
    <div className="relative z-10 w-full shrink-0 select-none pt-1">
      {/* 1. Placa de Nombre: Estilo Grabado Heritage en Rojo Corporativo y Oro (sin puntos suspensivos) */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-none border border-amber-300/60 bg-gradient-to-r from-[#990011] via-[#e2001a] to-[#990011] px-1 py-0.5 sm:py-1 text-center shadow-xs">
        <h3
          className={`whitespace-nowrap overflow-hidden font-sans font-black uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight ${nameStyle}`}
          title={knownAs}
        >
          {knownAs}
        </h3>
      </div>

      {/* 2. Cuadrícula de Estadísticas: 4 Casillas Nítidas */}
      <div className="mt-1 grid grid-cols-4 gap-1">
        {/* PJ */}
        <div className="rounded-none border border-neutral-300/60 bg-white py-0.5 text-center shadow-2xs">
          <span className="block text-[7.5px] font-black tracking-tight text-neutral-500 uppercase">
            PJ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-neutral-900">
            {isOwned ? matchesPlayed : "—"}
          </span>
        </div>

        {/* DEF */}
        <div className="rounded-none border border-neutral-300/60 bg-white py-0.5 text-center shadow-2xs">
          <span className="block text-[7.5px] font-black tracking-tight text-neutral-500 uppercase">
            DEF
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-neutral-900">
            {isOwned ? defensePower : "—"}
          </span>
        </div>

        {/* ATQ */}
        <div className="rounded-none border border-neutral-300/60 bg-white py-0.5 text-center shadow-2xs">
          <span className="block text-[7.5px] font-black tracking-tight text-[#e2001a] uppercase">
            ATQ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-[#e2001a]">
            {isOwned ? attackPower : "—"}
          </span>
        </div>

        {/* OVR */}
        <div className="rounded-none border border-amber-500/70 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 py-0.5 text-center shadow-2xs">
          <span className="block text-[7.5px] font-black tracking-tight text-amber-950 uppercase">
            OVR
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-neutral-950">
            {isOwned ? ovr : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
