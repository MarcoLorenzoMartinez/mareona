// Client: Estado interactivo de la pizarra, formaciones, arrastre y exportación PNG/Social
"use client";

import { useState } from "react";
import { PitchBoard } from "@/components/lineup-builder/pitch-board";
import { RosterDrawer } from "@/components/lineup-builder/roster-drawer";
import { RosterModal } from "@/components/lineup-builder/roster-modal";
import { LineupBuilderToolbar } from "@/components/lineup-builder/lineup-builder-toolbar";
import { ShareLineupModal } from "@/components/lineup-builder/share-lineup-modal";
import { downloadLineupPng } from "@/lib/lineup-builder/download-lineup";
import { useLineupState } from "@/components/lineup-builder/use-lineup-state";
import type { LineupPlayer } from "@/lib/lineup-builder/types";

interface LineupBuilderClientProps {
  readonly initialRoster: readonly LineupPlayer[];
  readonly nextMatchId?: string | null;
  readonly nextMatchOpponent?: string | null;
  readonly nextMatchOpponentCrestUrl?: string | null;
}

export function LineupBuilderClient({
  initialRoster,
  nextMatchId,
  nextMatchOpponent,
  nextMatchOpponentCrestUrl,
}: LineupBuilderClientProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const {
    formationKey,
    allPlayers,
    assignedSlots,
    assignedPlayerIds,
    activeSlot,
    selectedSlotId,
    isMobileRosterOpen,
    stagedPlayer,
    currentSharedLineup,
    handleFormationChange,
    handleResetLineup,
    handleMoveSlot,
    handleSelectSlot,
    handleCloseMobileRoster,
    handleCancelStaging,
    handleAssignPlayer,
    handleClearSlot,
    handleAddCustomPlayer,
  } = useLineupState(initialRoster);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await downloadLineupPng(formationKey, assignedSlots);
    } catch {
      // Non-blocking download failure
    } finally {
      setIsExporting(false);
    }
  };

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
            hasStagedPlayer={Boolean(stagedPlayer)}
            onSelectSlot={handleSelectSlot}
            onMoveSlot={handleMoveSlot}
            onClearSlot={handleClearSlot}
            onCancelStaging={handleCancelStaging}
          />
        </div>

        <div className="hidden lg:block lg:col-span-5">
          <RosterDrawer
            players={allPlayers}
            assignedPlayerIds={assignedPlayerIds}
            activeSlotRole={activeSlot ? activeSlot.role : null}
            activePlayer={activeSlot?.player ?? null}
            stagedPlayerId={stagedPlayer?.id ?? null}
            onAssignPlayer={handleAssignPlayer}
            onClearSlot={() => selectedSlotId && handleClearSlot(selectedSlotId)}
            onAddCustomPlayer={handleAddCustomPlayer}
          />
        </div>
      </div>

      <RosterModal
        isOpen={isMobileRosterOpen}
        onClose={handleCloseMobileRoster}
        players={allPlayers}
        assignedPlayerIds={assignedPlayerIds}
        activeSlotRole={activeSlot ? activeSlot.role : null}
        activePlayer={activeSlot?.player ?? null}
        stagedPlayerId={stagedPlayer?.id ?? null}
        onAssignPlayer={handleAssignPlayer}
        onClearSlot={() => selectedSlotId && handleClearSlot(selectedSlotId)}
        onAddCustomPlayer={handleAddCustomPlayer}
      />

      <ShareLineupModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lineup={currentSharedLineup}
        nextMatchId={nextMatchId}
        nextMatchOpponent={nextMatchOpponent}
        nextMatchOpponentCrestUrl={nextMatchOpponentCrestUrl}
      />
    </div>
  );
}
