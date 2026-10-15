import type { PlayerPositionsData } from "@/lib/sports-api/fotmob-player-profile-types";

interface PlayerPositionsPitchProps {
  readonly positions: PlayerPositionsData;
}

export function PlayerPositionsPitch({ positions }: PlayerPositionsPitchProps) {
  const sorted = [...positions.allPositions].sort((a, b) => b.occurrences - a.occurrences);

  return (
    <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
          Posiciones en el Campo
        </h2>
      </div>

      <div className="flex items-center justify-center pt-5">
        {/* Terreno de juego vertical táctico en proporción reglamentaria */}
        <div className="relative w-52 sm:w-60 aspect-[68/105] rounded-2xl overflow-hidden border border-neutral-200 bg-[#edf3ed] shadow-inner select-none shrink-0">
          {/* Marcado SVG del campo vertical */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 68 105"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Franjas horizontales de césped */}
            <rect x="0" y="0" width="68" height="15" fill="#f4f7f4" />
            <rect x="0" y="15" width="68" height="15" fill="#edf3ed" />
            <rect x="0" y="30" width="68" height="15" fill="#f4f7f4" />
            <rect x="0" y="45" width="68" height="15" fill="#edf3ed" />
            <rect x="0" y="60" width="68" height="15" fill="#f4f7f4" />
            <rect x="0" y="75" width="68" height="15" fill="#edf3ed" />
            <rect x="0" y="90" width="68" height="15" fill="#f4f7f4" />

            {/* Línea perimetral */}
            <rect x="3" y="3" width="62" height="99" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />

            {/* Medio campo y círculo central */}
            <line x1="3" y1="52.5" x2="65" y2="52.5" stroke="#cbd5cb" strokeWidth="0.8" />
            <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />
            <circle cx="34" cy="52.5" r="0.7" fill="#cbd5cb" />

            {/* Área superior (Ataque) */}
            <rect x="13.84" y="3" width="40.32" height="16.5" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />
            <rect x="24.84" y="3" width="18.32" height="5.5" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />
            <path d="M 26.7 19.5 A 9.15 9.15 0 0 0 41.3 19.5" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />

            {/* Área inferior (Defensa propia) */}
            <rect x="13.84" y="85.5" width="40.32" height="16.5" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />
            <rect x="24.84" y="96.5" width="18.32" height="5.5" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />
            <path d="M 26.7 85.5 A 9.15 9.15 0 0 1 41.3 85.5" fill="none" stroke="#cbd5cb" strokeWidth="0.8" />
          </svg>

          {/* Nodos de posición dibujados (secundarias primero, principal al final en capa superior) */}
          {[...sorted]
            .sort((a, b) => (a.isMain ? 1 : 0) - (b.isMain ? 1 : 0))
            .map((pos) => {
              const coords = pos.pitchCoordinates;
              if (!coords) return null;

              return (
                <div
                  key={pos.shortLabel}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                  style={{
                    left: `${coords.xPercent}%`,
                    top: `${coords.yPercent}%`,
                  }}
                >
                  <div
                    className={`flex items-center justify-center rounded-full uppercase transition-all shadow-xs ${
                      pos.isMain
                        ? "h-7 w-7 bg-[var(--primary)] text-white text-[10px] font-black ring-4 ring-red-500/20 scale-110 z-20"
                        : "h-6 w-6 bg-white/95 text-neutral-600 border border-neutral-300 text-[9px] font-bold z-10 opacity-80"
                    }`}
                    title={pos.label}
                  >
                    {pos.shortLabel}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
