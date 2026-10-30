/**
 * Skeleton loader for /temporada/estadisticas.
 * Streamed by Next.js for instant navigation (0 ms).
 */
export default function EstadisticasLoading() {
  return (
    <div
      className="flex flex-col gap-6 animate-pulse"
      aria-busy="true"
      aria-label="Cargando estadísticas del equipo..."
    >
      <div className="sr-only">Cargando estadísticas de la temporada...</div>

      {/* Hero cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs"
          >
            <div className="h-3 w-20 rounded bg-neutral-200" />
            <div className="h-8 w-16 rounded bg-neutral-100" />
            <div className="h-2 w-28 rounded bg-neutral-100" />
          </div>
        ))}
      </div>

      {/* Split & pitch visual charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
        <div className="h-64 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
      </div>

      {/* Metric blocks skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
        <div className="h-72 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
      </div>
    </div>
  );
}
