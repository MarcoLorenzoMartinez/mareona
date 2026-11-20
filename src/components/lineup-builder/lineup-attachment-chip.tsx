// Client: Previsualización fiel de la alineación táctica adjunta al compositor
"use client";

import { X } from "lucide-react";
import { SharedLineupPitchCard } from "./shared-lineup-pitch-card";
import type { SharedLineupData } from "@/lib/lineup-builder/shared-lineup-codec";
import { getDictionary } from "@/i18n";

interface LineupAttachmentChipProps {
  readonly lineup: SharedLineupData;
  readonly onRemove: () => void;
}

export function LineupAttachmentChip({
  lineup,
  onRemove,
}: LineupAttachmentChipProps) {
  const dict = getDictionary();
  return (
    <div className="relative my-3 w-full max-w-[300px] sm:max-w-[340px] select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Botón flotante para retirar la alineación adjunta */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={dict.lineupBuilder.attachment.removeAria}
        className="absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer shadow-md"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Previsualización real de la pizarra (idéntica a como saldrá publicada) */}
      <SharedLineupPitchCard lineup={lineup} className="my-0 w-full" />
    </div>
  );
}
