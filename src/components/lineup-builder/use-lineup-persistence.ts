// Client: Hook para persistencia y restauración automática de Mi Once en localStorage y cuenta
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
 * Manages automatic background synchronization of the tactical lineup with localStorage and Supabase.
 * Restores state safely upon page refresh or cross-device sync without SSR hydration mismatches.
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
  const isRestoringFromSyncRef = useRef(false);

  useEffect(() => {
    const restoreFromStorage = (fromSyncEvent = false) => {
      const saved = loadPersistedLineup();
      if (saved) {
        if (fromSyncEvent) {
          isRestoringFromSyncRef.current = true;
        }
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
    };

    restoreFromStorage(false);
    const onSynced = () => restoreFromStorage(true);
    window.addEventListener("mareona_account_state_synced", onSynced);
    return () => window.removeEventListener("mareona_account_state_synced", onSynced);
  }, [initialRoster, setCustomPlayers, setFormationKey, setAssignedSlots]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (isRestoringFromSyncRef.current) {
      isRestoringFromSyncRef.current = false;
      return;
    }
    if (!isHydratedRef.current) return;

    savePersistedLineup(formationKey, customPlayers, assignedSlots);
  }, [formationKey, customPlayers, assignedSlots]);

  return {
    clearStorage: clearPersistedLineup,
  };
}
