export default function PizarraLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Cargando pizarra...">
      <div className="flex items-center justify-between gap-3">
        <div className="h-10 w-44 rounded-full bg-neutral-200" />
        <div className="h-10 w-36 rounded-full bg-neutral-200" />
      </div>
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs space-y-4">
        <div className="h-96 rounded-xl bg-neutral-100" />
        <div className="flex justify-center gap-3">
          <div className="h-9 w-28 rounded-full bg-neutral-200" />
          <div className="h-9 w-28 rounded-full bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
