// Client: Gestión táctica del terreno de juego y reposicionamiento interactivo
"use client";

import { useRef, useCallback, useEffect } from "react";
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
  const startersRef = useRef(starters);
  useEffect(() => {
    startersRef.current = starters;
  }, [starters]);

  const dragRef = useRef<{
    slotId: string;
    startX: number;
    startY: number;
    initialCoord: PitchCoordinate;
    isDragging: boolean;
    pointerId: number;
    target: HTMLElement;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, slotId: string) => {
      // Solo capturar puntero principal (clic izquierdo o touch)
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const starter = startersRef.current.find((s) => s.slotId === slotId);
      if (!starter) return;

      dragRef.current = {
        slotId,
        startX: e.clientX,
        startY: e.clientY,
        initialCoord: starter.coord,
        isDragging: false,
        pointerId: e.pointerId,
        target: e.currentTarget as HTMLElement,
      };
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || !pitchRef.current) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      // Umbral de arrastre: requiere al menos 7px de desplazamiento voluntario para iniciar el movimiento
      if (!drag.isDragging) {
        if (Math.hypot(dx, dy) < 7) {
          return;
        }
        drag.isDragging = true;
        drag.target.setPointerCapture?.(drag.pointerId);
      }

      const rect = pitchRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const deltaXPercent = (dx / rect.width) * 100;
      const deltaYPercent = (dy / rect.height) * 100;

      const newCoord = clampPitchCoordinate({
        x: drag.initialCoord.x + deltaXPercent,
        y: drag.initialCoord.y + deltaYPercent,
      });

      onMoveSlot(drag.slotId, newCoord);
    },
    [onMoveSlot]
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    if (drag) {
      if (drag.isDragging) {
        drag.target.releasePointerCapture?.(drag.pointerId);
      }
      dragRef.current = null;
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
