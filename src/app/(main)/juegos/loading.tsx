export default function JuegosLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse" aria-busy="true" aria-label="Cargando juegos...">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="space-y-2.5">
            <div className="h-4 w-28 rounded bg-neutral-200" />
            <div className="h-3 w-full rounded bg-neutral-100" />
            <div className="h-3 w-3/4 rounded bg-neutral-100" />
          </div>
          <div className="h-16 rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
