// Client: Token táctico minimalista y moderno con fotos ampliadas y nombre conciso
"use client";

import { useMemo } from "react";
import { SafePlayerAvatar } from "./safe-player-avatar";
import { getConcisePlayerName } from "@/lib/lineup-builder/player-name-formatter";
import type { PitchAssignedPlayer } from "@/lib/lineup-builder/types";

interface PlayerTokenProps {
  readonly assigned: PitchAssignedPlayer;
  readonly isSelected: boolean;
  readonly onSelect: (slotId: string) => void;
  readonly onPointerDown?: (e: React.PointerEvent<HTMLDivElement>, slotId: string) => void;
}

/**
 * Modern minimalist player token node placed on the tactical grass pitch.
 * Focuses on prominent footballer photo cutouts with clean typography (no clutter).
 */
export function PlayerToken({
  assigned,
  isSelected,
  onSelect,
  onPointerDown,
}: PlayerTokenProps) {
  const { player, role, coord, slotId } = assigned;

  const shortName = useMemo(() => {
    if (!player) return "Asignar";
    return getConcisePlayerName(player.displayName);
  }, [player]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        player
          ? `Posición ${role}: ${shortName}`
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
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={(e) => onPointerDown?.(e, slotId)}
      style={{
        left: `${coord.x}%`,
        top: `${coord.y}%`,
      }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none select-none transition-transform duration-150 focus:outline-none ${
        isSelected ? "scale-105 z-30" : "hover:scale-105 z-20"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Token Circular Avatar Container */}
        <div
          className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full transition-all duration-150 ${
            player
              ? `border-2 bg-[#f3f4f3] ${
                  isSelected
                    ? "border-white ring-2 ring-[#e2001a] shadow-[0_0_12px_rgba(226,0,26,0.45)]"
                    : "border-white shadow-md hover:shadow-lg"
                }`
              : isSelected
              ? "border-2 border-white ring-2 ring-[#e2001a]/85 bg-black/45 shadow-[0_0_14px_rgba(226,0,26,0.35)] backdrop-blur-xs"
              : "border-2 border-dashed border-white/50 bg-black/30 hover:border-white/80 hover:bg-black/40"
          }`}
        >
          {player ? (
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <SafePlayerAvatar
                photoUrl={player.photoUrl}
                displayName={player.displayName}
                sizes="(max-width: 640px) 56px, 64px"
                isToken
              />
            </div>
          ) : (
            <span
              className={`text-xl leading-none transition-colors ${
                isSelected ? "text-white font-medium" : "text-white/60 font-light"
              }`}
            >
              +
            </span>
          )}
        </div>

        {/* Minimalist Player Name Label */}
        <div className="mt-1 flex flex-col items-center max-w-[90px] sm:max-w-[105px]">
          <span
            className={`rounded-full px-2.5 py-0.5 text-center text-[10px] sm:text-[11px] font-bold shadow-xs truncate w-full border backdrop-blur-xs transition-colors ${
              isSelected
                ? "bg-[#e2001a] text-white border-white/30 shadow-[0_0_8px_rgba(226,0,26,0.4)]"
                : "bg-black/80 text-white border-white/10"
            }`}
          >
            {shortName}
          </span>
        </div>
      </div>
    </div>
  );
}
