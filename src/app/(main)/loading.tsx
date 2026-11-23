export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Cargando inicio...">
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="h-3.5 w-40 rounded bg-neutral-200" />
          <div className="h-3.5 w-24 rounded bg-neutral-100" />
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-neutral-200" /><div className="h-4 w-24 rounded bg-neutral-200" /></div>
          <div className="h-10 w-16 rounded-md bg-neutral-200" />
          <div className="flex items-center gap-3"><div className="h-4 w-24 rounded bg-neutral-200" /><div className="h-11 w-11 rounded-full bg-neutral-200" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-2xs space-y-2 lg:hidden">
        <div className="h-9 rounded-lg bg-neutral-100" />
        <div className="grid grid-cols-3 gap-1.5">
          <div className="h-9 rounded-lg bg-neutral-100" />
          <div className="h-9 rounded-lg bg-neutral-100" />
          <div className="h-9 rounded-lg bg-neutral-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs space-y-3 lg:col-span-7">
          <div className="h-4 w-36 rounded bg-neutral-200" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-2.5"><div className="h-5 w-5 rounded-full bg-neutral-200" /><div className="h-3.5 w-32 rounded bg-neutral-200" /></div>
              <div className="h-3.5 w-16 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div className="hidden rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs space-y-3 lg:block">
            <div className="h-4 w-32 rounded bg-neutral-200" />
            <div className="h-10 rounded-lg bg-neutral-100" />
            <div className="grid grid-cols-3 gap-2"><div className="h-11 rounded-lg bg-neutral-100" /><div className="h-11 rounded-lg bg-neutral-100" /><div className="h-11 rounded-lg bg-neutral-100" /></div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs space-y-2.5">
            <div className="h-4 w-32 rounded bg-neutral-200" />
            <div className="h-3.5 w-full rounded bg-neutral-100" />
            <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
