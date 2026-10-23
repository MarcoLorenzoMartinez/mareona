"use client"; // Client: Cinta de control integrada en el pie del pliego del álbum

interface AlbumPageNavProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (targetPage: number) => void;
}

/**
 * Bottom console integrated into the album page spread.
 * Styled in warm cardstock matching the physical album pages, with Sporting red actions.
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
    <nav
      aria-label="Controles de navegación del álbum"
      className="relative flex flex-col items-center gap-2.5 rounded-b-lg border-x border-b border-amber-900/15 bg-white p-3 text-neutral-800 shadow-sm"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-1 sm:px-3">
        {/* Controles de salto a la izquierda: -5 y Página anterior */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(Math.max(1, currentPage - 5))}
            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 text-xs font-bold text-neutral-700 transition-all disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-2xs"
            title="Retroceder 5 páginas (Shift + ←)"
          >
            <span>−5</span>
            <span className="hidden sm:inline text-[10px] text-neutral-500">págs</span>
          </button>

          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1.5 rounded-full bg-[#e2001a] hover:bg-[#b30015] px-3.5 py-1 text-xs font-bold text-white transition-all disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-2xs"
            title="Página anterior (←)"
          >
            <span aria-hidden="true">←</span>
            <span>Anterior</span>
          </button>
        </div>

        {/* Centro: Salto directo a página */}
        <form
          onSubmit={handleSubmitInput}
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs shadow-2xs"
        >
          <span className="font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
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
            className="w-12 rounded-sm border border-neutral-300 bg-white text-center font-sans font-bold tabular-nums text-neutral-900 focus:border-[#e2001a] focus:outline-hidden py-0.5 text-xs shadow-2xs"
          />
          <span className="font-sans font-bold tabular-nums text-neutral-600">
            de {totalPages}
          </span>
        </form>

        {/* Controles de salto a la derecha: Siguiente y +5 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1.5 rounded-full bg-[#e2001a] hover:bg-[#b30015] px-3.5 py-1 text-xs font-bold text-white transition-all disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-2xs"
            title="Página siguiente (→)"
          >
            <span>Siguiente</span>
            <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 5))}
            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 text-xs font-bold text-neutral-700 transition-all disabled:pointer-events-none disabled:opacity-30 active:scale-95 shadow-2xs"
            title="Avanzar 5 páginas (Shift + →)"
          >
            <span>+5</span>
            <span className="hidden sm:inline text-[10px] text-neutral-500">págs</span>
          </button>
        </div>
      </div>

      {/* Cinta deslizadora continua */}
      <div className="flex w-full items-center gap-3 px-2 pt-0.5">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
          Hojear
        </span>
        <input
          type="range"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          aria-label="Cinta deslizadora de páginas"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#e2001a]"
        />
        <span className="text-[9px] text-neutral-400 hidden sm:inline shrink-0 font-medium">
          Usa teclas ← / →
        </span>
      </div>
    </nav>
  );
}
