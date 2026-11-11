// Client: Hook para la gestión del estado táctico, formación y asignación de Mi Once
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { TACTICAL_FORMATIONS } from "@/lib/lineup-builder/formations";
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

export function useLineupState(initialRoster: readonly LineupPlayer[]) {
  const [formationKey, setFormationKey] = useState<TacticalFormationKey>("4-2-3-1");
  const [customPlayers, setCustomPlayers] = useState<readonly LineupPlayer[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isMobileRosterOpen, setIsMobileRosterOpen] = useState(false);

  const allPlayers = useMemo(
    () => [...customPlayers, ...initialRoster],
    [customPlayers, initialRoster]
  );

  const [assignedSlots, setAssignedSlots] = useState<PitchAssignedPlayer[]>(() =>
    TACTICAL_FORMATIONS["4-2-3-1"].slots.map((slot) => ({
      slotId: slot.id,
      role: slot.defaultRole,
      coord: slot.defaultCoord,
      player: null,
    }))
  );

  useEffect(() => {
    saveLocalSharedLineup(buildSharedLineupFromSlots(formationKey, assignedSlots));
  }, [formationKey, assignedSlots]);

  const handleFormationChange = useCallback((newKey: TacticalFormationKey) => {
    setFormationKey(newKey);
    setSelectedSlotId(null);
    setIsMobileRosterOpen(false);
    const formation = TACTICAL_FORMATIONS[newKey];
    setAssignedSlots((prev) =>
      formation.slots.map((slot, index) => ({
        slotId: slot.id,
        role: slot.defaultRole,
        coord: slot.defaultCoord,
        player: prev[index]?.player ?? null,
      }))
    );
  }, []);

  const handleResetLineup = useCallback(() => {
    setSelectedSlotId(null);
    setIsMobileRosterOpen(false);
    setAssignedSlots(
      TACTICAL_FORMATIONS[formationKey].slots.map((slot) => ({
        slotId: slot.id,
        role: slot.defaultRole,
        coord: slot.defaultCoord,
        player: null,
      }))
    );
  }, [formationKey]);

  const handleMoveSlot = useCallback((slotId: string, newCoord: PitchCoordinate) => {
    setAssignedSlots((prev) => prev.map((s) => (s.slotId === slotId ? { ...s, coord: newCoord } : s)));
  }, []);

  const handleSelectSlot = useCallback((slotId: string) => {
    setSelectedSlotId(slotId);
    setIsMobileRosterOpen(true);
  }, []);

  const handleCloseMobileRoster = useCallback(() => {
    setIsMobileRosterOpen(false);
    setSelectedSlotId(null);
  }, []);

  const handleAssignPlayer = useCallback((player: LineupPlayer) => {
    if (!selectedSlotId) return;
    setAssignedSlots((prev) =>
      prev.map((s) => {
        if (s.slotId === selectedSlotId) return { ...s, player };
        if (s.player?.id === player.id) return { ...s, player: null };
        return s;
      })
    );
    setSelectedSlotId(null);
    setIsMobileRosterOpen(false);
  }, [selectedSlotId]);

  const handleAddCustomPlayer = useCallback(
    (player: LineupPlayer) => {
      setCustomPlayers((prev) => [player, ...prev]);
      handleAssignPlayer(player);
    },
    [handleAssignPlayer]
  );

  const assignedPlayerIds = useMemo(
    () => new Set(assignedSlots.map((s) => s.player?.id).filter(Boolean) as string[]),
    [assignedSlots]
  );

  const activeSlot = assignedSlots.find((s) => s.slotId === selectedSlotId);
  const currentSharedLineup = useMemo(
    () => buildSharedLineupFromSlots(formationKey, assignedSlots),
    [formationKey, assignedSlots]
  );

  return {
    formationKey,
    allPlayers,
    assignedSlots,
    assignedPlayerIds,
    activeSlot,
    selectedSlotId,
    isMobileRosterOpen,
    currentSharedLineup,
    handleFormationChange,
    handleResetLineup,
    handleMoveSlot,
    handleSelectSlot,
    handleCloseMobileRoster,
    handleAssignPlayer,
    handleAddCustomPlayer,
  };
}
