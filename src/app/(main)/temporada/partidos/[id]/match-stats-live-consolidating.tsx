/**
 * Graceful fallback state displayed during live matches when provider statistics
 * (shotmaps, xG, heatmaps) are still being aggregated and verified.
 * Replaces empty layout holes with clean, transparent feedback and structural skeleton.
 */
export function MatchStatsLiveConsolidating() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 sm:p-8 text-center shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[var(--primary)] border border-red-200">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-ping" aria-hidden="true" />
          <span>En directo · Consolidación oficial</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
          Estadísticas en preparación
        </h3>

        <p className="mx-auto max-w-md text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
          El proveedor deportivo está verificando las métricas en tiempo real de este encuentro
          (remates, goles esperados, zonas de ataque y posesión). Se mostrarán aquí de forma
          automática conforme se consoliden los datos.
        </p>
      </div>

      {/* Subtle skeleton representing incoming comparison bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((cardIdx) => (
          <div
            key={cardIdx}
            className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs space-y-4"
            aria-hidden="true"
          >
            <div className="h-3 w-24 rounded-full bg-neutral-200 animate-pulse" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((rowIdx) => (
                <div key={rowIdx} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span className="h-2.5 w-6 rounded bg-neutral-100" />
                    <span className="h-2.5 w-20 rounded bg-neutral-100" />
                    <span className="h-2.5 w-6 rounded bg-neutral-100" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-neutral-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
