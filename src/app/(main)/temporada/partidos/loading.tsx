export default function PartidosLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-busy="true">
      {/* Selector de filtros sobrio */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="h-6 w-36 rounded-md bg-neutral-200" />
        <div className="h-7 w-28 rounded-full bg-neutral-200" />
      </div>

      {/* Lista de partidos skeleton */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-neutral-200" />
              <div className="h-4 w-28 rounded bg-neutral-200" />
            </div>
            <div className="h-6 w-16 rounded-md bg-neutral-200" />
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 rounded bg-neutral-200" />
              <div className="h-8 w-8 rounded-full bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
