"use client"; // Client: Hook para gestión y sincronización reactiva de inventarios del álbum

import { useState, useEffect } from "react";
import type { DailyMissionState } from "@/lib/cards/types";
import {
  loadUserCardInventory,
  loadUserPackInventory,
  getDailyMissionState,
  DEFAULT_MISSION_STATE,
} from "@/lib/cards/pack-storage";

/**
 * Manages reactive synchronization of cards, booster packs, and daily objectives.
 * Automatically switches storage partition when the authenticated user session changes.
 */
export function useAlbumInventory(userId?: string) {
  const [prevUserId, setPrevUserId] = useState(userId);
  const [userInventory, setUserInventory] = useState(() => loadUserCardInventory(userId));
  const [packInventory, setPackInventory] = useState(() => loadUserPackInventory(userId));
  const [missionState, setMissionState] = useState<DailyMissionState>(() =>
    typeof window === "undefined" ? DEFAULT_MISSION_STATE : getDailyMissionState(undefined, userId)
  );

  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setUserInventory(loadUserCardInventory(userId));
    setPackInventory(loadUserPackInventory(userId));
    setMissionState(getDailyMissionState(undefined, userId));
  }

  useEffect(() => {
    const onPackSync = () => setPackInventory(loadUserPackInventory(userId));
    const onCardSync = () => setUserInventory(loadUserCardInventory(userId));
    const onMissionSync = () => setMissionState(getDailyMissionState(undefined, userId));
    const onFullSync = () => {
      onPackSync();
      onCardSync();
      onMissionSync();
    };

    // Refresh state immediately when view mounts or resumes from Next.js <Activity> cache
    queueMicrotask(onFullSync);

    window.addEventListener("mareona_pack_inventory_changed", onPackSync);
    window.addEventListener("mareona_card_inventory_changed", onCardSync);
    window.addEventListener("mareona_missions_state_changed", onMissionSync);
    window.addEventListener("focus", onFullSync);
    window.addEventListener("storage", onFullSync);
    return () => {
      window.removeEventListener("mareona_pack_inventory_changed", onPackSync);
      window.removeEventListener("mareona_card_inventory_changed", onCardSync);
      window.removeEventListener("mareona_missions_state_changed", onMissionSync);
      window.removeEventListener("focus", onFullSync);
      window.removeEventListener("storage", onFullSync);
    };
  }, [userId]);

  return {
    userInventory,
    setUserInventory,
    packInventory,
    setPackInventory,
    missionState,
    setMissionState,
  };
}
