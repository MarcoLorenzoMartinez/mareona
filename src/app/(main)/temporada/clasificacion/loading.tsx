export default function ClasificacionLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true">
      {/* Controles de vista y ámbito */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-9 w-64 rounded-full bg-neutral-200" />
        <div className="h-9 w-44 rounded-full bg-neutral-200" />
      </div>

      {/* Hero card posición del Sporting */}
      <div className="h-28 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs" />

      {/* Tabla de clasificación skeleton */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-neutral-200" />
                <div className="h-6 w-6 rounded-full bg-neutral-200" />
                <div className="h-4 w-32 rounded bg-neutral-200" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-8 rounded bg-neutral-200" />
                <div className="h-4 w-8 rounded bg-neutral-200" />
                <div className="h-4 w-8 rounded bg-neutral-200 font-bold" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
