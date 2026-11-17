// Client: Modal popup / bottom-sheet táctil para seleccionar jugadores en móvil
"use client";

import { useEffect } from "react";
import { RosterDrawer } from "./roster-drawer";
import type { LineupPlayer } from "@/lib/lineup-builder/types";

interface RosterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly players: readonly LineupPlayer[];
  readonly assignedPlayerIds: ReadonlySet<string>;
  readonly activeSlotRole: string | null;
  readonly stagedPlayerId?: string | null;
  readonly onAssignPlayer: (player: LineupPlayer) => void;
  readonly onAddCustomPlayer: (player: LineupPlayer) => void;
}

/**
 * Mobile-first bottom sheet / popup for selecting footballers on touch devices
 * without requiring the user to scroll down past the pitch canvas.
 */
export function RosterModal({
  isOpen,
  onClose,
  players,
  assignedPlayerIds,
  activeSlotRole,
  stagedPlayerId,
  onAssignPlayer,
  onAddCustomPlayer,
}: RosterModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Selección de jugador para la alineación"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 lg:hidden"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[var(--border)] bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Mobile handle indicator */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden" aria-hidden="true">
          <div className="h-1.5 w-12 rounded-full bg-neutral-300" />
        </div>

        <RosterDrawer
          players={players}
          assignedPlayerIds={assignedPlayerIds}
          activeSlotRole={activeSlotRole}
          stagedPlayerId={stagedPlayerId}
          onAssignPlayer={onAssignPlayer}
          onAddCustomPlayer={onAddCustomPlayer}
          onClose={onClose}
          isModal
        />
      </div>
    </div>
  );
}
