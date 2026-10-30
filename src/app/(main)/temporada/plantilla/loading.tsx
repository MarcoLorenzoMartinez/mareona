/**
 * Skeleton placeholder for the squad (/temporada/plantilla) page.
 * Rendered by Next.js streaming when transitioning between tabs to provide instant feedback.
 */
export default function PlantillaLoading() {
  return (
    <div
      className="flex flex-col gap-8 animate-pulse"
      aria-busy="true"
      aria-label="Cargando plantilla..."
    >
      <div className="sr-only">Cargando plantilla...</div>

      {/* Group skeleton (Goalkeepers, Defenders, Midfielders, Forwards) */}
      {[
        { titleWidth: "w-28", count: 2 },
        { titleWidth: "w-32", count: 6 },
        { titleWidth: "w-40", count: 8 },
        { titleWidth: "w-32", count: 4 },
      ].map((group, groupIdx) => (
        <section key={groupIdx} className="flex flex-col gap-3.5">
          <div className={`h-4 ${group.titleWidth} rounded-md bg-neutral-200`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {Array.from({ length: group.count }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-3 shadow-2xs"
              >
                <div className="aspect-square w-full rounded-xl bg-neutral-100" />
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="h-4 w-3/4 rounded-sm bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded-sm bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
