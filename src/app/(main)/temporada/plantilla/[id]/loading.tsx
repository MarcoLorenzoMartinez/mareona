/**
 * Skeleton placeholder for player profile route (/temporada/plantilla/[id]).
 * Displayed instantly by Next.js when navigating to a player's profile.
 */
export default function PlayerProfileLoading() {
  return (
    <div
      className="flex flex-col gap-8 pb-12 animate-pulse"
      aria-busy="true"
      aria-label="Cargando perfil del jugador..."
    >
      <div className="sr-only">Cargando perfil del jugador...</div>

      {/* Back button skeleton */}
      <div className="h-5 w-32 rounded-md bg-neutral-200" />

      {/* Hero card skeleton */}
      <div className="h-48 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-xs" />

      {/* Two columns grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-3xl bg-neutral-100" />
        <div className="h-64 rounded-3xl bg-neutral-100" />
      </div>
    </div>
  );
}
