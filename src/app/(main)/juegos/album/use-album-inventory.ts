"use client"; // Client: Hook para gestión y sincronización reactiva de inventarios del álbum

import { useState, useEffect } from "react";
import type { DailyMissionState } from "@/lib/cards/types";
import {
  loadUserCardInventory,
  loadUserPackInventory,
  getDailyMissionState,
  DEFAULT_MISSION_STATE,
  DEFAULT_PACK_INVENTORY,
  saveUserCardInventory,
} from "@/lib/cards/pack-storage";
import { loadUserCardsFromServer } from "@/lib/cards/actions";

/**
 * Manages reactive synchronization of cards, booster packs, and daily objectives.
 * Automatically switches storage partition when the authenticated user session changes.
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

    // Refresh state immediately when view mounts or resumes from Next.js <Activity> cache
    queueMicrotask(onFullSync);

    if (userId) {
      void loadUserCardsFromServer().then((serverCards) => {
        if (!serverCards) return;
        const localCards = loadUserCardInventory(userId);
        const merged: Record<string, number> = { ...localCards };
        let changed = false;
        for (const [slug, qty] of Object.entries(serverCards)) {
          if ((merged[slug] ?? 0) < qty) {
            merged[slug] = qty;
            changed = true;
          }
        }
        if (changed) {
          saveUserCardInventory(merged, userId);
          setUserInventory(merged);
        }
      });
    }

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
