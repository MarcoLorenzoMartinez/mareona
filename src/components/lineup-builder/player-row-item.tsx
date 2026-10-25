// Client: Fila de futbolista individual con avatar y acción de asignación
"use client";

import { SafePlayerAvatar } from "./safe-player-avatar";
import type { LineupPlayer } from "@/lib/lineup-builder/types";

interface PlayerRowItemProps {
  readonly player: LineupPlayer;
  readonly isAssigned: boolean;
  readonly onAssign: (player: LineupPlayer) => void;
}

export function PlayerRowItem({
  player,
  isAssigned,
  onAssign,
}: PlayerRowItemProps) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-2.5 transition-colors hover:bg-neutral-100/70">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 overflow-hidden border border-neutral-300">
          <SafePlayerAvatar
            photoUrl={player.photoUrl}
            displayName={player.displayName}
            sizes="40px"
          />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {player.shirtNumber !== null && (
            <span className="shrink-0 w-6 text-center text-xs font-extrabold text-[#e2001a] tabular-nums">
              {player.shirtNumber}
            </span>
          )}
          <span className="truncate text-xs font-bold text-neutral-900">
            {player.displayName}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isAssigned}
        onClick={() => onAssign(player)}
        aria-label={isAssigned ? `${player.displayName} ya está alineado` : `Alinear a ${player.displayName}`}
        className={`ml-2 shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
          isAssigned
            ? "border border-neutral-200/80 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
            : "bg-[#e2001a] text-white hover:bg-[#b30015] shadow-xs active:scale-95"
        }`}
      >
        {isAssigned ? "Alineado" : "Alinear"}
      </button>
    </li>
  );
}
