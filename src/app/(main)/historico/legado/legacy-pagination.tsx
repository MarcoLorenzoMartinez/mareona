// Client: Control accesible de paginación para tablas históricas
"use client";

interface LegacyPaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
  readonly itemLabel?: string;
}

export function LegacyPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "elementos",
}: LegacyPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Paginación de tabla"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-sans"
    >
      <span className="text-neutral-500 tabular-nums">
        Mostrando{" "}
        <strong className="text-neutral-900 font-semibold">{startItem}</strong>
        –
        <strong className="text-neutral-900 font-semibold">{endItem}</strong> de{" "}
        <strong className="text-neutral-900 font-semibold">{totalItems}</strong> {itemLabel}
      </span>

      <div className="flex items-center gap-1.5 tabular-nums">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
        >
          Anterior
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Ir a la página ${p}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`h-7 w-7 rounded-lg text-xs transition-all active:scale-95 ${
                  isCurrent
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "border border-[var(--border)] bg-white text-neutral-700 font-medium hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
          className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
