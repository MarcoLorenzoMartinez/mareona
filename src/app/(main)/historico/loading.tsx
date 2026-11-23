export default function HistoricoLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Cargando archivo histórico...">
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs space-y-4">
        <div className="h-4 w-44 rounded bg-neutral-200" />
        <div className="h-40 rounded-lg bg-neutral-100" />
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
            <div className="h-3.5 w-40 rounded bg-neutral-200" />
            <div className="h-3.5 w-16 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
