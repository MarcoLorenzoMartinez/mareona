"use client"; // Client: Hook para gestión y sincronización reactiva de inventarios del álbum

import { useState, useEffect } from "react";
import type { DailyMissionState } from "@/lib/cards/types";
import {
  loadUserCardInventory,
  loadUserPackInventory,
  getDailyMissionState,
  DEFAULT_MISSION_STATE,
  DEFAULT_PACK_INVENTORY,
} from "@/lib/cards/pack-storage";
import { syncAlbumAccountWithServer } from "@/lib/cards/account-sync-client";

/**
 * Manages reactive synchronization of cards, booster packs, and daily objectives.
 * Automatically reconciles local device state with Supabase whenever the session,
 * tab focus, or visibility changes so all devices display identical state.
 */
export function useAlbumInventory(userId?: string) {
  const [prevUserId, setPrevUserId] = useState(userId);
  const [userInventory, setUserInventory] = useState<Record<string, number>>({});
  const [packInventory, setPackInventory] = useState(DEFAULT_PACK_INVENTORY);
  const [missionState, setMissionState] = useState<DailyMissionState>(DEFAULT_MISSION_STATE);

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
    const onServerReconcile = () => {
      onFullSync();
      if (userId) {
        void syncAlbumAccountWithServer(userId, "reconcile");
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onServerReconcile();
      }
    };

    // Refresh state immediately when view mounts or resumes from Next.js <Activity> cache
    queueMicrotask(onServerReconcile);

    window.addEventListener("mareona_pack_inventory_changed", onPackSync);
    window.addEventListener("mareona_card_inventory_changed", onCardSync);
    window.addEventListener("mareona_missions_state_changed", onMissionSync);
    window.addEventListener("focus", onServerReconcile);
    window.addEventListener("storage", onFullSync);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("mareona_pack_inventory_changed", onPackSync);
      window.removeEventListener("mareona_card_inventory_changed", onCardSync);
      window.removeEventListener("mareona_missions_state_changed", onMissionSync);
      window.removeEventListener("focus", onServerReconcile);
      window.removeEventListener("storage", onFullSync);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
