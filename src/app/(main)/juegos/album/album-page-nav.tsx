"use client"; // Client: Riel deslizador antiguo integrado en el papel del álbum

interface AlbumPageNavProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (targetPage: number) => void;
}

/**
 * Vintage page scrubber slider integrated directly into the physical album paper.
 * Features an engraved parchment groove and an authentic carmine-red wax/brass knob.
 */
export function AlbumPageNav({
  currentPage,
  totalPages,
  onPageChange,
}: AlbumPageNavProps) {
  return (
    <nav
      aria-label="Selector de página del álbum"
      className="relative z-10 w-full px-4 sm:px-8 pt-1.5 pb-2.5"
    >
      {/* Indicador tipográfico de imprenta clásica */}
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900/60 pb-1 select-none">
        <span className="tabular-nums">Pág. 1</span>
        <span
          className="text-[10.5px] font-black text-amber-950/85 tracking-[0.2em]"
          style={{ textShadow: "0 1px 0 rgba(255,250,235,0.8)" }}
        >
          Página {currentPage} de {totalPages}
        </span>
        <span className="tabular-nums">Pág. {totalPages}</span>
      </div>

      {/* Riel deslizador con hendidura troquelada y tirador en rojo Sporting */}
      <div className="relative flex items-center w-full">
        <input
          type="range"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          aria-label="Deslizar para seleccionar página del álbum"
          aria-valuemin={1}
          aria-valuemax={totalPages}
          aria-valuenow={currentPage}
          className="h-2 sm:h-2.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd3be] border border-amber-900/30 shadow-[inset_0_1px_3px_rgba(70,40,10,0.35)] focus:outline-hidden
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#e2001a]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#fcedc7]
            [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#e2001a]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#fcedc7]
            [&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.35)]
            [&::-moz-range-thumb]:cursor-grab"
        />
      </div>
    </nav>
  );
}
