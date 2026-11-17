// Client: Hook para persistencia y restauración automática de Mi Once en localStorage
"use client";

import { useEffect, useRef } from "react";
import {
  savePersistedLineup,
  loadPersistedLineup,
  clearPersistedLineup,
  restoreSlotsWithRoster,
} from "@/lib/lineup-builder/lineup-storage";
import type {
  LineupPlayer,
  PitchAssignedPlayer,
  TacticalFormationKey,
} from "@/lib/lineup-builder/types";

interface UseLineupPersistenceOptions {
  readonly formationKey: TacticalFormationKey;
  readonly customPlayers: readonly LineupPlayer[];
  readonly assignedSlots: readonly PitchAssignedPlayer[];
  readonly initialRoster: readonly LineupPlayer[];
  readonly setFormationKey: React.Dispatch<React.SetStateAction<TacticalFormationKey>>;
  readonly setCustomPlayers: React.Dispatch<React.SetStateAction<readonly LineupPlayer[]>>;
  readonly setAssignedSlots: React.Dispatch<React.SetStateAction<readonly PitchAssignedPlayer[]>>;
}

/**
 * Manages automatic background synchronization of the tactical lineup with localStorage.
 * Restores state safely upon page refresh without SSR hydration mismatches.
 */
export function useLineupPersistence({
  formationKey,
  customPlayers,
  assignedSlots,
  initialRoster,
  setFormationKey,
  setCustomPlayers,
  setAssignedSlots,
}: UseLineupPersistenceOptions) {
  const isHydratedRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Restore persisted lineup on initial client mount
  useEffect(() => {
    const saved = loadPersistedLineup();
    if (saved) {
      if (saved.customPlayers?.length) {
        setCustomPlayers(saved.customPlayers);
      }
      if (saved.formationKey) {
        setFormationKey(saved.formationKey);
      }
      const pool = [...saved.customPlayers, ...initialRoster];
      setAssignedSlots(restoreSlotsWithRoster(saved.slots, pool));
    }
    isHydratedRef.current = true;
  }, [initialRoster, setCustomPlayers, setFormationKey, setAssignedSlots]);

  // Auto-save changes strictly AFTER initial hydration has completed and state has settled
  useEffect(() => {
    // Avoid saving on initial mount to prevent overwriting stored lineup with blank initial state
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (!isHydratedRef.current) return;

    savePersistedLineup(formationKey, customPlayers, assignedSlots);
  }, [formationKey, customPlayers, assignedSlots]);

  return {
    clearStorage: clearPersistedLineup,
  };
}
