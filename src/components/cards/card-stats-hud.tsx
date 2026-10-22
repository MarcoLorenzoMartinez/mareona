interface CardStatsHudProps {
  readonly knownAs: string;
  readonly eraLabel: string;
  readonly matchesPlayed: number;
  readonly defensePower: number;
  readonly attackPower: number;
  readonly ovr: number;
  readonly isOwned: boolean;
}

/**
 * Unified athletic telemetry HUD bar for Panini Adrenalyn style cards.
 * Combines high-impact typography banner and interconnected stat blocks.
 */
export function CardStatsHud({
  knownAs,
  eraLabel,
  matchesPlayed,
  defensePower,
  attackPower,
  ovr,
  isOwned,
}: CardStatsHudProps) {
  return (
    <div className="relative z-10 w-full shrink-0 select-none">
      {/* 1. Franja de Identidad: Nombre en relieve y Época deportiva */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 via-[#c40016] to-neutral-950 px-2 py-1 text-center border-y border-amber-400/60 shadow-md">
        <h3
          className="truncate font-sans font-black text-xs sm:text-sm uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          title={knownAs}
        >
          {knownAs}
        </h3>
        <p className="truncate text-[8.5px] sm:text-[9.5px] font-bold text-amber-200/90 tracking-tight">
          {eraLabel}
        </p>
      </div>

      {/* 2. Barra de Telemetría: 4 Bloques Deportivos Interconectados */}
      <div className="grid grid-cols-4 gap-0.5 bg-neutral-950 p-1 border-b border-x border-amber-400/40">
        {/* Bloque PJ */}
        <div className="bg-neutral-900/95 py-0.5 text-center border-t border-white/20">
          <span className="block text-[7.5px] font-black tracking-wider text-neutral-400 uppercase">
            PJ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-white">
            {isOwned ? matchesPlayed : "—"}
          </span>
        </div>

        {/* Bloque DEF */}
        <div className="bg-neutral-900/95 py-0.5 text-center border-t border-sky-400/40">
          <span className="block text-[7.5px] font-black tracking-wider text-sky-300 uppercase">
            DEF
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-white">
            {isOwned ? defensePower : "—"}
          </span>
        </div>

        {/* Bloque ATQ */}
        <div className="bg-neutral-900/95 py-0.5 text-center border-t border-red-500/50">
          <span className="block text-[7.5px] font-black tracking-wider text-red-400 uppercase">
            ATQ
          </span>
          <span className="font-sans font-black tabular-nums text-xs text-white">
            {isOwned ? attackPower : "—"}
          </span>
        </div>

        {/* Bloque OVR Dorado */}
        <div className="bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 py-0.5 text-center shadow-xs">
          <span className="block text-[7.5px] font-black tracking-wider text-neutral-950 uppercase">
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
