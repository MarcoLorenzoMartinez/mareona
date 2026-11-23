/**
 * Shared single-game loading skeleton so navigating between /juegos and any
 * individual game subsection renders a focused card skeleton instead of the 6-card hub grid.
 */
export function GameRouteSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 animate-pulse" aria-busy="true" aria-label="Cargando juego...">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded-md bg-neutral-200" />
        <div className="h-8 w-24 rounded-full bg-neutral-200" />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs space-y-4">
        <div className="h-4 w-36 rounded bg-neutral-200" />
        <div className="h-36 rounded-xl bg-neutral-100" />
        <div className="h-10 w-full rounded-full bg-neutral-200" />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs space-y-2.5">
        <div className="h-4 w-28 rounded bg-neutral-200" />
        <div className="h-3.5 w-full rounded bg-neutral-100" />
        <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
      </div>
    </div>
  );
}
