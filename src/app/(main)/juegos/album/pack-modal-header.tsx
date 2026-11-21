"use client"; // Client: Cabecera del modal de apertura de sobres

import { MiniPack } from "@/components/cards/mini-pack";
import type { PackTier } from "@/lib/cards/types";
import { getDictionary } from "@/i18n";

interface PackModalHeaderProps {
  readonly tier: PackTier;
  readonly tierName: string;
  readonly allRevealed: boolean;
  readonly onRevealAllNow: () => void;
  readonly onDismiss: () => void;
}

export function PackModalHeader({
  tier,
  tierName,
  allRevealed,
  onRevealAllNow,
  onDismiss,
}: PackModalHeaderProps) {
  const dict = getDictionary();

  return (
    <div className="flex w-full items-center justify-between border-b border-[var(--border)] pb-2.5 sm:pb-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <MiniPack tier={tier} />
        <h2 id="pack-modal-title" className="font-sans text-xs sm:text-base font-bold text-neutral-900 uppercase tracking-wide truncate">
          {tierName}
        </h2>
        {!allRevealed && (
          <button
            type="button"
            onClick={onRevealAllNow}
            className="shrink-0 rounded-full border border-[var(--border)] bg-neutral-50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-neutral-600 hover:border-[#e2001a] hover:text-[#e2001a] hover:bg-red-50/50 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            title={dict.games.album.packs.modalSkipTitle}
          >
            {dict.games.album.packs.modalSkipButton}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label={dict.games.album.packs.modalCloseAria}
        className="flex h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        ✕
      </button>
    </div>
  );
}
