// Client: Token interactivo con soporte de drag & drop, foco accesible y selección
"use client";

import { SafePlayerAvatar } from "./safe-player-avatar";
import type { PitchAssignedPlayer } from "@/lib/lineup-builder/types";

interface PlayerTokenProps {
  readonly assigned: PitchAssignedPlayer;
  readonly isSelected: boolean;
  readonly onSelect: (slotId: string) => void;
  readonly onDragStart?: (e: React.DragEvent<HTMLDivElement>, slotId: string) => void;
  readonly onPointerDown?: (e: React.PointerEvent<HTMLDivElement>, slotId: string) => void;
}

/**
 * Player token node placed dynamically on the tactical grass pitch.
 * Displays circular cutout photo, dorsal pill, player name and tactical role.
 */
export function PlayerToken({
  assigned,
  isSelected,
  onSelect,
  onDragStart,
  onPointerDown,
}: PlayerTokenProps) {
  const { player, role, coord, slotId } = assigned;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        player
          ? `Posición ${role}: ${player.displayName}`
          : `Posición ${role}: Vacía. Pulsa para asignar jugador.`
      }
      aria-pressed={isSelected}
      onClick={() => onSelect(slotId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(slotId);
        }
      }}
      draggable={Boolean(player)}
      onDragStart={(e) => onDragStart?.(e, slotId)}
      onPointerDown={(e) => onPointerDown?.(e, slotId)}
      style={{
        left: `${coord.x}%`,
        top: `${coord.y}%`,
      }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none select-none transition-transform duration-150 focus:outline-none ${
        isSelected ? "scale-110 z-30" : "hover:scale-105 z-20"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Token Circular Avatar Container */}
        <div
          className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 bg-[#e5e9e5] shadow-md ${
            isSelected
              ? "border-[#e2001a] ring-3 ring-white shadow-lg"
              : player
              ? "border-white/90"
              : "border-dashed border-white/60 bg-black/40 hover:border-white"
          }`}
        >
          {player ? (
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <SafePlayerAvatar
                photoUrl={player.photoUrl}
                displayName={player.displayName}
                sizes="(max-width: 640px) 48px, 56px"
                isToken
              />
            </div>
          ) : (
            <span className="text-white/80 text-xl font-light leading-none">+</span>
          )}

          {/* Role badge top-right */}
          <span className="absolute -top-1 -right-1 rounded-full bg-neutral-900/95 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-xs border border-white/20">
            {role}
          </span>
        </div>

        {/* Player Name and Shirt Number capsule */}
        <div className="mt-1 flex flex-col items-center max-w-[85px] sm:max-w-[100px]">
          <span className="rounded-full bg-black/85 px-2 py-0.5 text-center text-[10px] sm:text-[11px] font-semibold text-white shadow-xs truncate w-full border border-white/10 backdrop-blur-xs">
            {player?.displayName ?? "Asignar"}
          </span>

          {player?.shirtNumber !== null && player?.shirtNumber !== undefined && (
            <span className="mt-0.5 text-[9px] font-bold text-white/90 drop-shadow-md tabular-nums">
              #{player.shirtNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
