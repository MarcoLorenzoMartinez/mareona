"use client"; // Client: Cinta de control y marcapáginas con atajos para pasar páginas del álbum

interface AlbumPageNavProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (targetPage: number) => void;
}

/**
 * Bottom ribbon console integrated seamlessly into the album spine.
 * Offers fast skips (-5 / +5), direct page input, a bookmark scrub slider, and prev/next controls.
 */
export function AlbumPageNav({
  currentPage,
  totalPages,
  onPageChange,
}: AlbumPageNavProps) {
  const handleSubmitInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("pageNumber") as HTMLInputElement | null;
    if (!input) return;
    const num = parseInt(input.value, 10);
    if (!Number.isNaN(num)) {
      const clamped = Math.max(1, Math.min(totalPages, num));
      onPageChange(clamped);
      input.value = String(clamped);
    }
  };

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <footer
      aria-label="Controles de navegación del álbum"
      className="relative flex flex-col items-center gap-2.5 rounded-b-lg border-t border-amber-900/20 bg-gradient-to-b from-[#2b1f14] to-[#1e150d] p-3 text-amber-100 shadow-xl"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-2">
        {/* Left jump controls: -5 and Previous page */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(Math.max(1, currentPage - 5))}
            className="flex items-center gap-1 rounded-sm border border-amber-500/30 bg-black/40 px-2 py-1 text-xs font-bold text-amber-200/90 transition-all hover:bg-amber-950/80 hover:text-white disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-xs"
            title="Retroceder 5 páginas (Shift + ←)"
          >
            <span>−5</span>
            <span className="hidden sm:inline text-[10px] text-amber-400/60">págs</span>
          </button>

          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1.5 rounded-sm border border-amber-500/40 bg-[#e2001a] px-3 py-1 text-xs font-bold text-white transition-all hover:bg-[#b30015] disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-xs"
            title="Página anterior (←)"
          >
            <span aria-hidden="true">←</span>
            <span>Anterior</span>
          </button>
        </div>

        {/* Center: Direct page jump input styled as embossed bookplate */}
        <form
          onSubmit={handleSubmitInput}
          className="flex items-center gap-2 rounded-sm border border-amber-600/40 bg-black/60 px-2.5 py-1 text-xs shadow-inner"
        >
          <span className="font-semibold text-amber-300/70 text-[11px] uppercase tracking-wider">
            Pág.
          </span>
          <input
            key={currentPage}
            name="pageNumber"
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            onBlur={(e) => {
              const num = parseInt(e.target.value, 10);
              if (!Number.isNaN(num)) {
                onPageChange(Math.max(1, Math.min(totalPages, num)));
              }
            }}
            aria-label="Número de página a visitar"
            className="w-12 rounded-xs border border-amber-500/50 bg-[#160e08] text-center font-sans font-bold tabular-nums text-white focus:border-amber-400 focus:outline-hidden py-0.5 text-xs shadow-xs"
          />
          <span className="font-sans font-bold tabular-nums text-amber-200/80">
            de {totalPages}
          </span>
        </form>

        {/* Right jump controls: Next page and +5 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1.5 rounded-sm border border-amber-500/40 bg-[#e2001a] px-3 py-1 text-xs font-bold text-white transition-all hover:bg-[#b30015] disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-xs"
            title="Página siguiente (→)"
          >
            <span>Siguiente</span>
            <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 5))}
            className="flex items-center gap-1 rounded-sm border border-amber-500/30 bg-black/40 px-2 py-1 text-xs font-bold text-amber-200/90 transition-all hover:bg-amber-950/80 hover:text-white disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-xs"
            title="Avanzar 5 páginas (Shift + →)"
          >
            <span>+5</span>
            <span className="hidden sm:inline text-[10px] text-amber-400/60">págs</span>
          </button>
        </div>
      </div>

      {/* Visual bookmark ribbon scrub bar */}
      <div className="flex w-full items-center gap-3 px-2 pt-0.5">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-400/50 shrink-0">
          Hojear
        </span>
        <input
          type="range"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          aria-label="Cinta deslizadora de páginas"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-amber-950/80 accent-[#e2001a]"
        />
        <span className="text-[9px] text-amber-400/40 hidden sm:inline shrink-0 font-medium">
          Usa teclas ← / →
        </span>
      </div>
    </footer>
  );
}
