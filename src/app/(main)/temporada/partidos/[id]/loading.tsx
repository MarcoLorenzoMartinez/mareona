/**
 * Skeleton placeholder for the match detail (/temporada/partidos/[id]) route.
 * Displayed instantly by Next.js when navigating into a match.
 */
export default function MatchDetailLoading() {
  return (
    <div
      className="flex flex-col gap-3 animate-pulse"
      aria-busy="true"
      aria-label="Cargando detalles del partido..."
    >
      <div className="sr-only">Cargando detalles del partido...</div>

      {/* Back button skeleton */}
      <div className="h-5 w-32 rounded-md bg-neutral-200" />

      {/* Match hero card skeleton */}
      <div className="flex h-52 flex-col items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs">
        <div className="h-4 w-40 rounded-full bg-neutral-200" />
        <div className="flex w-full max-w-md items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-full bg-neutral-200" />
            <div className="h-4 w-20 rounded bg-neutral-200" />
          </div>
          <div className="h-10 w-16 rounded-lg bg-neutral-100" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-full bg-neutral-200" />
            <div className="h-4 w-20 rounded bg-neutral-200" />
          </div>
        </div>
      </div>

      {/* Segmented tabs skeleton */}
      <div className="mx-auto h-10 w-72 rounded-full bg-neutral-200" />

      {/* Main card skeleton */}
      <div className="h-64 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
    </div>
  );
}
