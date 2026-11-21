// Client: Hook de acciones de apertura de sobres, misiones diarias y reciclaje en el álbum
"use client";

import { useCallback } from "react";
import { toast } from "@/lib/ui/toast";
import { generatePackCards } from "@/lib/cards/packs";
import { persistAcquiredCardsToServer } from "@/lib/cards/actions";
import {
  loadUserPackInventory,
  consumeUserPack,
  loadUserCardInventory,
  addCardsToInventory,
  getDailyMissionState,
  claimDailyLoginPack,
  claimDailyGamePack,
  recycleDuplicates,
} from "@/lib/cards/pack-storage";
import type { Card, DailyMissionState, PackTier, UserPackInventory } from "@/lib/cards/types";
import { getDictionary } from "@/i18n";

interface UseAlbumActionsOptions {
  readonly userId?: string;
  readonly allCards: readonly Card[];
  readonly userInventory: Record<string, number>;
  readonly setUserInventory: (inv: Record<string, number>) => void;
  readonly setPackInventory: (inv: UserPackInventory) => void;
  readonly setMissionState: (st: DailyMissionState) => void;
  readonly setNewlyAcquiredSlugs: React.Dispatch<React.SetStateAction<Set<string>>>;
  readonly openAuthModal: (mode?: "signin" | "signup") => void;
}

export function useAlbumActions({
  userId,
  allCards,
  userInventory,
  setUserInventory,
  setPackInventory,
  setMissionState,
  setNewlyAcquiredSlugs,
  openAuthModal,
}: UseAlbumActionsOptions) {
  const dict = getDictionary();

  const handleOpenPackCards = useCallback(
    (tier: PackTier): { cards: Card[]; duplicateSlugs: Set<string> } | null => {
      if (!userId) return null;
      const consumed = consumeUserPack(tier, userId);
      if (!consumed) return null;
      setPackInventory(loadUserPackInventory(userId));
      const previouslyOwned = new Set(
        Object.entries(userInventory)
          .filter(([, q]) => q > 0)
          .map(([s]) => s)
      );
      const generated = generatePackCards(tier, allCards, previouslyOwned);

      const duplicateSlugs = new Set<string>();
      const seenInPack = new Set<string>();
      for (const card of generated) {
        if (previouslyOwned.has(card.slug) || seenInPack.has(card.slug)) {
          duplicateSlugs.add(card.slug);
        }
        seenInPack.add(card.slug);
      }

      const nextInventory = addCardsToInventory(generated, userId);
      setUserInventory(nextInventory);
      void persistAcquiredCardsToServer(generated.map((c) => c.slug));
      const brandNewCards = generated.filter((c) => !previouslyOwned.has(c.slug));
      setNewlyAcquiredSlugs((prev) => new Set([...prev, ...brandNewCards.map((c) => c.slug)]));
      return { cards: generated, duplicateSlugs };
    },
    [allCards, userId, userInventory, setPackInventory, setUserInventory, setNewlyAcquiredSlugs]
  );

  const handleClaimLogin = useCallback(() => {
    if (!userId) return openAuthModal("signin");
    const res = claimDailyLoginPack(userId);
    if (res.success && res.tier) {
      setPackInventory(loadUserPackInventory(userId));
      setMissionState(getDailyMissionState(undefined, userId));
      toast.success(dict.games.album.toasts.dailyLoginTitle, {
        description: dict.games.album.toasts.dailyLoginDesc,
      });
    }
  }, [userId, openAuthModal, setPackInventory, setMissionState, dict]);

  const handleClaimDailyGame = useCallback(() => {
    if (!userId) return openAuthModal("signin");
    const res = claimDailyGamePack(userId);
    if (res.success && res.tier) {
      setPackInventory(loadUserPackInventory(userId));
      setMissionState(getDailyMissionState(undefined, userId));
      const packName =
        res.tier === "leyenda"
          ? dict.games.album.toasts.legendPackName
          : dict.games.album.toasts.redWhitePackName;
      toast.success(dict.games.album.toasts.dailyGameTitle, {
        description: `${dict.games.album.toasts.dailyGameDescPrefix} ${packName}.`,
      });
    }
  }, [userId, openAuthModal, setPackInventory, setMissionState, dict]);

  const handleRecycle = useCallback(() => {
    if (!userId) return openAuthModal("signin");
    const res = recycleDuplicates(userId);
    if (res.success) {
      setUserInventory(loadUserCardInventory(userId));
      setPackInventory(loadUserPackInventory(userId));
      toast.success(dict.games.album.toasts.recycleSuccess);
    } else {
      toast.error(dict.games.album.toasts.recycleError);
    }
  }, [userId, openAuthModal, setUserInventory, setPackInventory, dict]);

  return { handleOpenPackCards, handleClaimLogin, handleClaimDailyGame, handleRecycle };
}
