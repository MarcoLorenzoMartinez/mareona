// Client: Hook para la gestión del estado táctico, formación y asignación de Mi Once
"use client";

import { useState, useCallback, useMemo } from "react";
import { TACTICAL_FORMATIONS, inferRoleFromHeight } from "@/lib/lineup-builder/formations";
import { remapSlotsForNewFormation } from "@/lib/lineup-builder/formation-transition";
import { buildSharedLineupFromSlots } from "@/lib/lineup-builder/shared-lineup-codec";
import { useLineupPersistence } from "./use-lineup-persistence";
import type {
  LineupPlayer,
  PitchAssignedPlayer,
  PitchCoordinate,
  TacticalFormationKey,
} from "@/lib/lineup-builder/types";

export function useLineupState(initialRoster: readonly LineupPlayer[]) {
  const [formationKey, setFormationKey] = useState<TacticalFormationKey>("4-2-3-1");
  const [customPlayers, setCustomPlayers] = useState<readonly LineupPlayer[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [stagedPlayer, setStagedPlayer] = useState<LineupPlayer | null>(null);
  const [isMobileRosterOpen, setIsMobileRosterOpen] = useState(false);

  const allPlayers = useMemo(() => [...customPlayers, ...initialRoster], [customPlayers, initialRoster]);

  const [assignedSlots, setAssignedSlots] = useState<readonly PitchAssignedPlayer[]>(() => {
    const defaultFormation = TACTICAL_FORMATIONS["4-2-3-1"];
    return defaultFormation.slots.map((slot) => ({
      slotId: slot.id,
      role: slot.defaultRole,
      coord: slot.defaultCoord,
      player: null,
    }));
  });

  const { clearStorage } = useLineupPersistence({
    formationKey, customPlayers, assignedSlots, initialRoster,
    setFormationKey, setCustomPlayers, setAssignedSlots,
  });

  const handleFormationChange = useCallback((newKey: TacticalFormationKey) => {
    setFormationKey(newKey);
    setSelectedSlotId(null);
    setStagedPlayer(null);
    setIsMobileRosterOpen(false);
    setAssignedSlots((prevSlots) => remapSlotsForNewFormation(prevSlots, newKey));
  }, []);

  const handleClearSlot = useCallback((slotId: string) => {
    setAssignedSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, player: null } : s))
    );
    setSelectedSlotId(null);
    setStagedPlayer(null);
    setIsMobileRosterOpen(false);
  }, []);

  const handleResetLineup = useCallback(() => {
    setSelectedSlotId(null);
    setStagedPlayer(null);
    setIsMobileRosterOpen(false);
    clearStorage();
    setAssignedSlots(
      TACTICAL_FORMATIONS[formationKey].slots.map((s) => ({
        slotId: s.id, role: s.defaultRole, coord: s.defaultCoord, player: null,
      }))
    );
  }, [formationKey, clearStorage]);

  const handleMoveSlot = useCallback(
    (slotId: string, newCoord: PitchCoordinate) => {
      setAssignedSlots((prev) =>
        prev.map((s) => {
          if (s.slotId !== slotId) return s;
          const initialSlot = TACTICAL_FORMATIONS[formationKey].slots.find((slot) => slot.id === slotId);
          const defaultRole = initialSlot?.defaultRole ?? s.role;
          const inferredRole = inferRoleFromHeight(newCoord.y, slotId, defaultRole);
          return { ...s, coord: newCoord, role: inferredRole };
        })
      );
    },
    [formationKey]
  );

  const handleSelectSlot = useCallback(
    (slotId: string) => {
      if (stagedPlayer) {
        setAssignedSlots((prev) =>
          prev.map((s) => {
            if (s.slotId === slotId) return { ...s, player: stagedPlayer };
            if (s.player?.id === stagedPlayer.id) return { ...s, player: null };
            return s;
          })
        );
        setStagedPlayer(null);
        setSelectedSlotId(null);
        return;
      }
      setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
      if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) {
        setIsMobileRosterOpen(true);
      }
    },
    [stagedPlayer]
  );

  const handleAssignPlayer = useCallback(
    (player: LineupPlayer) => {
      if (selectedSlotId) {
        setAssignedSlots((prev) =>
          prev.map((s) => {
            if (s.slotId === selectedSlotId) return { ...s, player };
            if (s.player?.id === player.id) return { ...s, player: null };
            return s;
          })
        );
        setSelectedSlotId(null);
        setStagedPlayer(null);
        setIsMobileRosterOpen(false);
        return;
      }
      if (stagedPlayer?.id === player.id) {
        setStagedPlayer(null);
        return;
      }
      setStagedPlayer(player);
      setIsMobileRosterOpen(false);
    },
    [selectedSlotId, stagedPlayer]
  );

  const handleAddCustomPlayer = useCallback((player: LineupPlayer) => {
    setCustomPlayers((prev) => [player, ...prev]);
    handleAssignPlayer(player);
  }, [handleAssignPlayer]);

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
    stagedPlayer,
    currentSharedLineup,
    handleFormationChange,
    handleResetLineup,
    handleMoveSlot,
    handleSelectSlot,
    handleCloseMobileRoster: () => { setIsMobileRosterOpen(false); setSelectedSlotId(null); },
    handleCancelStaging: () => setStagedPlayer(null),
    handleAssignPlayer,
    handleClearSlot,
    handleAddCustomPlayer,
  };
}
