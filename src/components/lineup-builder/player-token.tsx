// Client: Token táctico minimalista y moderno con fotos ampliadas y cápsula blanca corporativa
"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { SafePlayerAvatar } from "./safe-player-avatar";
import { getConcisePlayerName } from "@/lib/lineup-builder/player-name-formatter";
import type { PitchAssignedPlayer } from "@/lib/lineup-builder/types";

interface PlayerTokenProps {
  readonly assigned: PitchAssignedPlayer;
  readonly isSelected: boolean;
  readonly isCandidate?: boolean;
  readonly onSelect: (slotId: string) => void;
  readonly onPointerDown?: (e: React.PointerEvent<HTMLDivElement>, slotId: string) => void;
  readonly onClear?: (slotId: string) => void;
}

/**
 * Modern minimalist player token node placed on the tactical grass pitch.
 * Uses a crisp circular photo container and a unified white name capsule with red circular dorsal.
 */
export function PlayerToken({
  assigned,
  isSelected,
  isCandidate = false,
  onSelect,
  onPointerDown,
  onClear,
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
        isSelected ? "scale-105 z-30" : isCandidate ? "scale-105 z-25" : "hover:scale-105 z-20"
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
              : isCandidate
              ? "border-2 border-white ring-2 ring-[#e2001a] bg-[#e2001a]/30 shadow-[0_0_14px_rgba(226,0,26,0.5)] cursor-pointer"
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
                isSelected || isCandidate ? "text-white font-bold" : "text-white/60 font-light"
              }`}
            >
              +
            </span>
          )}

          {player && isSelected && onClear && (
            <button
              type="button"
              aria-label={`Quitar a ${shortName} de la alineación`}
              onClick={(e) => {
                e.stopPropagation();
                onClear(slotId);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute -top-1 -right-1 z-40 flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-neutral-900 text-white border-2 border-white shadow-md hover:bg-[#e2001a] transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Modern Pure White Player Name Capsule (only shown when player is assigned) */}
        {player && (
          <div className="mt-1 flex flex-col items-center max-w-[110px] sm:max-w-[125px]">
            <div
              className={`flex items-center overflow-hidden rounded-full shadow-sm border transition-all ${
                isSelected
                  ? "bg-[#e2001a] border-white/40 ring-2 ring-[#e2001a] text-white shadow-[0_0_10px_rgba(226,0,26,0.5)]"
                  : "bg-white text-neutral-900 border-neutral-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
              } ${
                player.shirtNumber !== null && player.shirtNumber > 0
                  ? "pl-1 pr-2.5 py-0.5 gap-1.5"
                  : "px-2.5 py-0.5"
              }`}
            >
              {player.shirtNumber !== null && player.shirtNumber > 0 && (
                <span
                  className={`flex h-[18px] w-[18px] sm:h-[19px] sm:w-[19px] shrink-0 items-center justify-center rounded-full font-bold tabular-nums transition-colors shadow-2xs ${
                    player.shirtNumber >= 10
                      ? "text-[8.5px] sm:text-[9px] tracking-tight"
                      : "text-[9.5px] sm:text-[10px]"
                  } ${isSelected ? "bg-white text-[#e2001a]" : "bg-[#e2001a] text-white"}`}
                >
                  <span className="leading-none -translate-y-[1px]">
                    {player.shirtNumber}
                  </span>
                </span>
              )}
              <span
                className={`text-[10px] sm:text-[11px] font-bold truncate tracking-tight ${
                  isSelected ? "text-white" : "text-neutral-900"
                }`}
              >
                {shortName}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
