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
  readonly hasStagedPlayer?: boolean;
  readonly onCancelStaging?: () => void;
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
  hasStagedPlayer = false,
  onCancelStaging,
}: PitchBoardProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const startersRef = useRef(starters);
  const didDragRef = useRef(false);
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startersRef.current = starters;
  }, [starters]);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

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

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
      didDragRef.current = false;

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
        didDragRef.current = true;
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
        // Suprimir el evento 'click' subsiguiente tras un arrastre intencionado
        if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = setTimeout(() => {
          didDragRef.current = false;
        }, 120);
      }
      dragRef.current = null;
    }
  }, []);

  const handleTokenSelect = useCallback(
    (slotId: string) => {
      // Ignorar selección si acabamos de soltar un movimiento de arrastre
      if (didDragRef.current) return;
      onSelectSlot(slotId);
    },
    [onSelectSlot]
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer Pitch Card */}
      <div
        ref={pitchRef}
        onClick={(e) => {
          if (e.target === pitchRef.current) onCancelStaging?.();
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full max-w-[480px] aspect-[68/105] overflow-hidden rounded-2xl border-4 border-neutral-900 bg-[#256e36] shadow-xl select-none"
      >
        {/* SVG Markings and Grass Striping */}
        <TacticalGrassMarkings />

        {/* Subtle Watermark in the bottom-right grass margin */}
        <div className="absolute inset-x-3.5 bottom-0.5 z-10 flex items-center justify-end pointer-events-none select-none">
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-white/45 uppercase leading-none">
            mareona
          </span>
        </div>

        {/* Render 11 Starter Tokens */}
        {starters.map((assigned) => (
          <PlayerToken
            key={assigned.slotId}
            assigned={assigned}
            isSelected={assigned.slotId === selectedSlotId}
            isCandidate={hasStagedPlayer && !assigned.player}
            onSelect={handleTokenSelect}
            onPointerDown={handlePointerDown}
          />
        ))}
      </div>
    </div>
  );
}
