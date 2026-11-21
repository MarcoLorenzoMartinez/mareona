// Client: Hook de acciones autoritativas en servidor para apertura de sobres, misiones y reciclaje
"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "@/lib/ui/toast";
import {
  claimDailyGameServerAction,
  claimDailyLoginServerAction,
  openPackServerAction,
  recycleDuplicatesServerAction,
} from "@/lib/cards/actions";
import { applyServerAccountAlbumSnapshot } from "@/lib/cards/account-sync-client";
import {
  getDailyMissionState,
  loadUserCardInventory,
  loadUserPackInventory,
} from "@/lib/cards/pack-storage";
import type { Card, DailyMissionState, PackTier, UserPackInventory } from "@/lib/cards/types";
import { getDictionary } from "@/i18n";

interface UseAlbumActionsOptions {
  readonly userId?: string;
  readonly userInventory: Record<string, number>;
  readonly setUserInventory: (inv: Record<string, number>) => void;
  readonly setPackInventory: (inv: UserPackInventory) => void;
  readonly setMissionState: (st: DailyMissionState) => void;
  readonly setNewlyAcquiredSlugs: React.Dispatch<React.SetStateAction<Set<string>>>;
  readonly openAuthModal: (mode?: "signin" | "signup") => void;
}

export function useAlbumActions({
  userId,
  userInventory,
  setUserInventory,
  setPackInventory,
  setMissionState,
  setNewlyAcquiredSlugs,
  openAuthModal,
}: UseAlbumActionsOptions) {
  const dict = getDictionary();
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const openingLockRef = useRef(false);

  const syncFromSnapshot = useCallback(
    (snapshot: Parameters<typeof applyServerAccountAlbumSnapshot>[1]) => {
      if (!userId) return;
      applyServerAccountAlbumSnapshot(userId, snapshot);
      setUserInventory(loadUserCardInventory(userId));
      setPackInventory(loadUserPackInventory(userId));
      setMissionState(getDailyMissionState(undefined, userId));
    },
    [userId, setUserInventory, setPackInventory, setMissionState]
  );

  const handleOpenPackCards = useCallback(
    async (tier: PackTier): Promise<{ cards: Card[]; duplicateSlugs: Set<string> } | null> => {
      if (!userId || openingLockRef.current) return null;
      openingLockRef.current = true;
      setIsOpeningPack(true);
      try {
        const res = await openPackServerAction(tier);
        if (!res.success || !res.cards || !res.snapshot) {
          toast.error(res.error ?? "No te quedan sobres disponibles de este tipo.");
          return null;
        }
        const brandNewSlugs = res.cards
          .filter((c) => (userInventory[c.slug] ?? 0) === 0)
          .map((c) => c.slug);
        syncFromSnapshot(res.snapshot);
        if (brandNewSlugs.length > 0) {
          setNewlyAcquiredSlugs((prev) => new Set([...prev, ...brandNewSlugs]));
        }
        return {
          cards: [...res.cards],
          duplicateSlugs: new Set(res.duplicateSlugs ?? []),
        };
      } catch {
        toast.error("Necesitas conexión para abrir sobres y guardarlos en tu cuenta.");
        return null;
      } finally {
        openingLockRef.current = false;
        setIsOpeningPack(false);
      }
    },
    [userId, userInventory, syncFromSnapshot, setNewlyAcquiredSlugs]
  );

  const handleClaimLogin = useCallback(async () => {
    if (!userId) return openAuthModal("signin");
    try {
      const res = await claimDailyLoginServerAction();
      if (res.success && res.snapshot) {
        syncFromSnapshot(res.snapshot);
        toast.success(dict.games.album.toasts.dailyLoginTitle, {
          description: dict.games.album.toasts.dailyLoginDesc,
        });
      }
    } catch {
      toast.error("No se pudo reclamar el sobre diario en este momento.");
    }
  }, [userId, openAuthModal, syncFromSnapshot, dict]);

  const handleClaimDailyGame = useCallback(async () => {
    if (!userId) return openAuthModal("signin");
    try {
      const res = await claimDailyGameServerAction();
      if (res.success && res.tier && res.snapshot) {
        syncFromSnapshot(res.snapshot);
        const packName =
          res.tier === "leyenda"
            ? dict.games.album.toasts.legendPackName
            : dict.games.album.toasts.redWhitePackName;
        toast.success(dict.games.album.toasts.dailyGameTitle, {
          description: `${dict.games.album.toasts.dailyGameDescPrefix} ${packName}.`,
        });
      }
    } catch {
      toast.error("No se pudo reclamar la recompensa de juego en este momento.");
    }
  }, [userId, openAuthModal, syncFromSnapshot, dict]);

  const handleRecycle = useCallback(async () => {
    if (!userId) return openAuthModal("signin");
    try {
      const res = await recycleDuplicatesServerAction();
      if (res.success && res.snapshot) {
        syncFromSnapshot(res.snapshot);
        toast.success(dict.games.album.toasts.recycleSuccess);
      } else {
        toast.error(dict.games.album.toasts.recycleError);
      }
    } catch {
      toast.error(dict.games.album.toasts.recycleError);
    }
  }, [userId, openAuthModal, syncFromSnapshot, dict]);

  return {
    isOpeningPack,
    handleOpenPackCards,
    handleClaimLogin,
    handleClaimDailyGame,
    handleRecycle,
  };
}
