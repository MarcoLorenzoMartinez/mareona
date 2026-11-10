// Client: Chip indicador de alineación táctica adjunta al compositor
"use client";

import type { SharedLineupData } from "@/lib/lineup-builder/shared-lineup-codec";

interface LineupAttachmentChipProps {
  readonly lineup: SharedLineupData;
  readonly onRemove: () => void;
}

export function LineupAttachmentChip({
  lineup,
  onRemove,
}: LineupAttachmentChipProps) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800 w-fit animate-in fade-in zoom-in-95 duration-100">
      <span className="text-[#e2001a]">📋</span>
      <span>Mi Once</span>
      <span className="rounded-full bg-neutral-200 px-1.5 py-0.2 text-[10px] font-bold text-neutral-700 tabular-nums">
        {lineup.formationKey}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar alineación adjunta"
        className="ml-1 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-[#e2001a] transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
