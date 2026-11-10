// Client: Estado interactivo de la pizarra, formaciones, arrastre y exportación PNG/Social
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { PitchBoard } from "@/components/lineup-builder/pitch-board";
import { RosterDrawer } from "@/components/lineup-builder/roster-drawer";
import { LineupBuilderToolbar } from "@/components/lineup-builder/lineup-builder-toolbar";
import { ShareLineupModal } from "@/components/lineup-builder/share-lineup-modal";
import { TACTICAL_FORMATIONS } from "@/lib/lineup-builder/formations";
import { exportLineupToBlob } from "@/lib/lineup-builder/export-canvas";
import { findNextSlotBottomToTop } from "@/lib/lineup-builder/slot-ordering";
import {
  buildSharedLineupFromSlots,
  saveLocalSharedLineup,
} from "@/lib/lineup-builder/shared-lineup-codec";
import type {
  LineupPlayer,
  TacticalFormationKey,
  PitchAssignedPlayer,
  PitchCoordinate,
} from "@/lib/lineup-builder/types";

interface LineupBuilderClientProps {
  readonly initialRoster: readonly LineupPlayer[];
  readonly nextMatchId?: string | null;
  readonly nextMatchOpponent?: string | null;
}

export function LineupBuilderClient({
  initialRoster,
  nextMatchId,
  nextMatchOpponent,
}: LineupBuilderClientProps) {
  const [formationKey, setFormationKey] = useState<TacticalFormationKey>("4-2-3-1");
  const [customPlayers, setCustomPlayers] = useState<readonly LineupPlayer[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>("s-por");
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const allPlayers = useMemo(() => [...customPlayers, ...initialRoster], [customPlayers, initialRoster]);

  const [assignedSlots, setAssignedSlots] = useState<PitchAssignedPlayer[]>(() => {
    return TACTICAL_FORMATIONS["4-2-3-1"].slots.map((slot) => ({
      slotId: slot.id,
      role: slot.defaultRole,
      coord: slot.defaultCoord,
      player: null,
    }));
  });

  useEffect(() => {
    saveLocalSharedLineup(buildSharedLineupFromSlots(formationKey, assignedSlots));
  }, [formationKey, assignedSlots]);

  const handleFormationChange = (newKey: TacticalFormationKey) => {
    setFormationKey(newKey);
    const formation = TACTICAL_FORMATIONS[newKey];
    setAssignedSlots((prev) =>
      formation.slots.map((slot, index) => ({
        slotId: slot.id,
        role: slot.defaultRole,
        coord: slot.defaultCoord,
        player: prev[index]?.player ?? null,
      }))
    );
  };

  const handleResetLineup = () => {
    const formation = TACTICAL_FORMATIONS[formationKey];
    setAssignedSlots(
      formation.slots.map((slot) => ({
        slotId: slot.id,
        role: slot.defaultRole,
        coord: slot.defaultCoord,
        player: null,
      }))
    );
  };

  const handleMoveSlot = useCallback((slotId: string, newCoord: PitchCoordinate) => {
    setAssignedSlots((prev) => prev.map((s) => (s.slotId === slotId ? { ...s, coord: newCoord } : s)));
  }, []);

  const handleAssignPlayer = (player: LineupPlayer) => {
    if (!selectedSlotId) return;
    const updated = assignedSlots.map((s) => {
      if (s.slotId === selectedSlotId) return { ...s, player };
      if (s.player?.id === player.id) return { ...s, player: null };
      return s;
    });
    setAssignedSlots(updated);

    const nextSlotId = findNextSlotBottomToTop(updated, selectedSlotId);
    if (nextSlotId) setSelectedSlotId(nextSlotId);
  };

  const handleAddCustomPlayer = (player: LineupPlayer) => {
    setCustomPlayers((prev) => [player, ...prev]);
    handleAssignPlayer(player);
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const blob = await exportLineupToBlob({
        formationLabel: formationKey,
        teamTitle: "Real Sporting",
        starters: assignedSlots,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `once-real-sporting-${formationKey.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Non-blocking download failure
    } finally {
      setIsExporting(false);
    }
  };

  const assignedPlayerIds = useMemo(
    () => new Set(assignedSlots.map((s) => s.player?.id).filter(Boolean) as string[]),
    [assignedSlots]
  );

  const activeSlot = assignedSlots.find((s) => s.slotId === selectedSlotId);
  const currentSharedLineup = useMemo(
    () => buildSharedLineupFromSlots(formationKey, assignedSlots),
    [formationKey, assignedSlots]
  );

  return (
    <div className="flex flex-col gap-6">
      <LineupBuilderToolbar
        formationKey={formationKey}
        onFormationChange={handleFormationChange}
        onResetLineup={handleResetLineup}
        onDownload={handleDownload}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        isExporting={isExporting}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex justify-center">
          <PitchBoard
            starters={assignedSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            onMoveSlot={handleMoveSlot}
            pitchTitle="Real Sporting"
            formationLabel={formationKey}
          />
        </div>

        <div className="lg:col-span-5">
          <RosterDrawer
            players={allPlayers}
            assignedPlayerIds={assignedPlayerIds}
            activeSlotRole={activeSlot ? activeSlot.role : null}
            onAssignPlayer={handleAssignPlayer}
            onAddCustomPlayer={handleAddCustomPlayer}
          />
        </div>
      </div>

      <ShareLineupModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lineup={currentSharedLineup}
        nextMatchId={nextMatchId}
        nextMatchOpponent={nextMatchOpponent}
      />
    </div>
  );
}
