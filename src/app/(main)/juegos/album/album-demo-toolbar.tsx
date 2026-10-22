"use client"; // Client: Controles interactivos de inspección de cromos para cuentas de prueba

export type AlbumDemoViewMode = "starter" | "all-revealed" | "all-hidden";

interface AlbumDemoToolbarProps {
  readonly userEmail: string;
  readonly viewMode: AlbumDemoViewMode;
  readonly totalCards: number;
  readonly onRevealAll: () => void;
  readonly onHideAll: () => void;
  readonly onResetStarter: () => void;
}

/**
 * Inspection toolbar for demo and evaluation accounts.
 * Allows instant unlocking/revealing of all ~500 cards or previewing them in their hidden/locked state.
 */
export function AlbumDemoToolbar({
  userEmail,
  viewMode,
  totalCards,
  onRevealAll,
  onHideAll,
  onResetStarter,
}: AlbumDemoToolbarProps) {
  return (
    <aside
      aria-label="Panel de evaluación Demo"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-amber-50/90 p-3 shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-300/40 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-sans font-bold text-xs text-amber-950 uppercase tracking-wide">
            Herramientas Demo
          </span>
          <span className="text-[10px] text-amber-900/70 font-medium truncate max-w-[220px]">
            {userEmail}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onRevealAll}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
            viewMode === "all-revealed"
              ? "bg-[#e2001a] text-white ring-2 ring-[#e2001a]/30"
              : "border border-amber-300 bg-white text-neutral-800 hover:bg-amber-100/60 active:scale-95"
          }`}
          title="Desbloquear y revelar todas las cartas de la colección"
        >
          Revelar todas ({totalCards})
        </button>

        <button
          type="button"
          onClick={onHideAll}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
            viewMode === "all-hidden"
              ? "bg-[#e2001a] text-white ring-2 ring-[#e2001a]/30"
              : "border border-amber-300 bg-white text-neutral-800 hover:bg-amber-100/60 active:scale-95"
          }`}
          title="Ver cómo lucen todas las cartas ocultas por descubrir"
        >
          Ver ocultas (0%)
        </button>

        <button
          type="button"
          onClick={onResetStarter}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
            viewMode === "starter"
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 active:scale-95"
          }`}
          title="Restablecer a la baraja inicial auténtica de 6 cromos"
        >
          Inicial (6)
        </button>
      </div>
    </aside>
  );
}
