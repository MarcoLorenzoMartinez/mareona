// Client: Gestión táctica del terreno de juego y reposicionamiento interactivo
"use client";

import { useRef, useCallback } from "react";
import { TacticalGrassMarkings } from "./tactical-grass-markings";
import { PlayerToken } from "./player-token";
import { clampPitchCoordinate } from "@/lib/lineup-builder/formations";
import type { PitchAssignedPlayer, PitchCoordinate } from "@/lib/lineup-builder/types";

interface PitchBoardProps {
  readonly starters: readonly PitchAssignedPlayer[];
  readonly selectedSlotId: string | null;
  readonly onSelectSlot: (slotId: string) => void;
  readonly onMoveSlot: (slotId: string, newCoord: PitchCoordinate) => void;
  readonly pitchTitle?: string;
  readonly formationLabel?: string;
}

/**
 * Visual football pitch canvas with realistic grass aesthetics, FIFA markings,
 * and direct drag-and-reposition support for custom player placements.
 */
export function PitchBoard({
  starters,
  selectedSlotId,
  onSelectSlot,
  onMoveSlot,
  pitchTitle = "Real Sporting",
  formationLabel = "4-2-3-1",
}: PitchBoardProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const activeDragSlot = useRef<string | null>(null);

  const calculateCoordFromPointer = useCallback((clientX: number, clientY: number): PitchCoordinate | null => {
    if (!pitchRef.current) return null;
    const rect = pitchRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    return clampPitchCoordinate({ x: rawX, y: rawY });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, slotId: string) => {
    // Only capture primary pointer (mouse or touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;
    activeDragSlot.current = slotId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDragSlot.current) return;
    const newCoord = calculateCoordFromPointer(e.clientX, e.clientY);
    if (newCoord) {
      onMoveSlot(activeDragSlot.current, newCoord);
    }
  }, [calculateCoordFromPointer, onMoveSlot]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDragSlot.current) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      activeDragSlot.current = null;
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer Pitch Card */}
      <div
        ref={pitchRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full max-w-[480px] aspect-[68/105] overflow-hidden rounded-2xl border-4 border-neutral-900 bg-[#256e36] shadow-xl select-none"
      >
        {/* SVG Markings and Grass Striping */}
        <TacticalGrassMarkings />

        {/* Pitch Watermark Header */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-xs border border-white/10">
          <span className="text-[11px] font-bold tracking-wider text-white uppercase">
            {pitchTitle}
          </span>
          <span className="text-[10px] font-medium text-white/70">
            ({formationLabel})
          </span>
        </div>

        {/* Render 11 Starter Tokens */}
        {starters.map((assigned) => (
          <PlayerToken
            key={assigned.slotId}
            assigned={assigned}
            isSelected={assigned.slotId === selectedSlotId}
            onSelect={onSelectSlot}
            onPointerDown={handlePointerDown}
          />
        ))}
      </div>
    </div>
  );
}
