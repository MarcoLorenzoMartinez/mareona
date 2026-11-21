"use client"; // Client: Controles interactivos de inspección de cromos para cuentas de prueba

import { getDictionary } from "@/i18n";

export type AlbumDemoViewMode = "starter" | "all-revealed" | "all-hidden";

interface AlbumDemoToolbarProps {
  readonly userEmail: string;
  readonly viewMode: AlbumDemoViewMode;
  readonly totalCards: number;
  readonly onRevealAll: () => void;
  readonly onHideAll: () => void;
  readonly onResetStarter: () => void;
  readonly onAddPack: (tier: "aficionado" | "rojiblanco" | "leyenda") => void;
  readonly onClearPacks: () => void;
}

/**
 * Inspection toolbar for demo and evaluation accounts.
 * Allows instant unlocking/revealing of cards, previewing states, and generating test card packs.
 */
export function AlbumDemoToolbar({
  userEmail,
  viewMode,
  totalCards,
  onRevealAll,
  onHideAll,
  onResetStarter,
  onAddPack,
  onClearPacks,
}: AlbumDemoToolbarProps) {
  const dict = getDictionary();
  if (process.env.NODE_ENV === "production") return null;
  return (
    <aside
      aria-label={dict.games.album.demoToolbar.aria}
      className="flex flex-col gap-3 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-amber-50/90 p-3 shadow-2xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-300/40 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-sans font-bold text-xs text-amber-950 uppercase tracking-wide">
              {dict.games.album.demoToolbar.title}
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
            title={dict.games.album.demoToolbar.revealAllTitle}
          >
            {dict.games.album.demoToolbar.revealAllLabel} ({totalCards})
          </button>

          <button
            type="button"
            onClick={onHideAll}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
              viewMode === "all-hidden"
                ? "bg-[#e2001a] text-white ring-2 ring-[#e2001a]/30"
                : "border border-amber-300 bg-white text-neutral-800 hover:bg-amber-100/60 active:scale-95"
            }`}
            title={dict.games.album.demoToolbar.hideAllTitle}
          >
            {dict.games.album.demoToolbar.hideAllLabel}
          </button>

          <button
            type="button"
            onClick={onResetStarter}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
              viewMode === "starter"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 active:scale-95"
            }`}
            title={dict.games.album.demoToolbar.resetTitle}
          >
            {dict.games.album.demoToolbar.resetLabel}
          </button>
        </div>
      </div>

      {/* Selector para otorgar sobres de prueba */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/80">
        <span className="font-sans text-[11px] font-bold text-amber-950 uppercase tracking-wider mr-1">
          {dict.games.album.demoToolbar.addPacksLabel}
        </span>
        <button
          type="button"
          onClick={() => onAddPack("aficionado")}
          className="shrink-0 rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-xs font-bold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:scale-95 transition-all shadow-2xs"
          title={dict.games.album.demoToolbar.addAficionadoTitle}
        >
          {dict.games.album.demoToolbar.addAficionadoLabel}
        </button>
        <button
          type="button"
          onClick={() => onAddPack("rojiblanco")}
          className="shrink-0 rounded-full border border-red-300 bg-white px-2.5 py-0.5 text-xs font-bold text-[#e2001a] hover:bg-red-50 active:scale-95 transition-all shadow-2xs"
          title={dict.games.album.demoToolbar.addRojiblancoTitle}
        >
          {dict.games.album.demoToolbar.addRojiblancoLabel}
        </button>
        <button
          type="button"
          onClick={() => onAddPack("leyenda")}
          className="shrink-0 rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 hover:bg-amber-100 active:scale-95 transition-all shadow-2xs"
          title={dict.games.album.demoToolbar.addLeyendaTitle}
        >
          {dict.games.album.demoToolbar.addLeyendaLabel}
        </button>
        <button
          type="button"
          onClick={onClearPacks}
          className="shrink-0 ml-auto rounded-full border border-neutral-300 bg-transparent px-2.5 py-0.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 hover:border-neutral-400 active:scale-95 transition-all"
          title={dict.games.album.demoToolbar.clearPacksTitle}
        >
          {dict.games.album.demoToolbar.clearPacksLabel}
        </button>
      </div>
    </aside>
  );
}
