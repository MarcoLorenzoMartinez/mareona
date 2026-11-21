"use client"; // Client: Gestión interactiva de colección, filtros, inventario de sobres y pegado

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/ui/toast";
import type { Card, PackTier } from "@/lib/cards/types";
import { useAuth } from "@/context/auth-context";
import { isDemoEmail } from "@/lib/auth/demo-credentials";
import { AlbumHeader, type AlbumViewMode } from "./album-header";
import { AlbumDemoToolbar, type AlbumDemoViewMode } from "./album-demo-toolbar";
import { PackOpeningModal } from "./pack-opening-modal";
import { AlbumSpreadView } from "./album-spread-view";
import { AlbumGridTabView } from "./album-grid-tab-view";
import { MyPacksView } from "./my-packs-view";
import { useAlbumInventory } from "./use-album-inventory";
import { useAlbumActions } from "./use-album-actions";
import { useAlbumTesterSeed } from "./use-album-tester-seed";
import { addPacksToInventory, clearUserPacks } from "@/lib/cards/pack-storage";
import {
  DEFAULT_GRID_FILTER_STATE,
  filterGridCards,
  sortGridCards,
  type GridFilterState,
} from "./grid-filter-types";
import { getDictionary } from "@/i18n";

interface AlbumClientViewProps {
  readonly allCards: readonly Card[];
}

export function AlbumClientView({ allCards }: AlbumClientViewProps) {
  const dict = getDictionary();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = process.env.NODE_ENV !== "production" && isDemoEmail(user?.email);
  const [demoViewMode, setDemoViewMode] = useState<AlbumDemoViewMode>("starter");
  const [gridFilterState, setGridFilterState] = useState<GridFilterState>(DEFAULT_GRID_FILTER_STATE);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [selectedPackTier, setSelectedPackTier] = useState<PackTier>("aficionado");
  const [activePackData, setActivePackData] = useState<{ cards: Card[]; duplicateSlugs: Set<string> }>({
    cards: [],
    duplicateSlugs: new Set(),
  });

  const rawTabParam = searchParams.get("tab") ?? searchParams.get("view");
  const urlViewMode: AlbumViewMode = rawTabParam === "packs" || rawTabParam === "grid" ? rawTabParam : "album";
  const [manualTab, setManualTab] = useState<{ readonly baseParam: string | null; readonly mode: AlbumViewMode } | null>(null);
  const viewMode: AlbumViewMode = manualTab && manualTab.baseParam === rawTabParam ? manualTab.mode : urlViewMode;

  const handleViewModeChange = useCallback(
    (mode: AlbumViewMode) => {
      setManualTab({ baseParam: rawTabParam, mode });
      const nextUrl = mode === "album" ? "/juegos/album" : `/juegos/album?tab=${mode}`;
      router.replace(nextUrl, { scroll: false });
    },
    [rawTabParam, router]
  );

  const [newlyAcquiredSlugs, setNewlyAcquiredSlugs] = useState<Set<string>>(new Set());
  const { userInventory, setUserInventory, packInventory, setPackInventory, missionState, setMissionState } =
    useAlbumInventory(user?.id);

  useAlbumTesterSeed(user?.id, isDemo, setPackInventory);
  const { handleOpenPackCards, handleClaimLogin, handleClaimDailyGame, handleRecycle } = useAlbumActions({
    userId: user?.id,
    allCards,
    userInventory,
    setUserInventory,
    setPackInventory,
    setMissionState,
    setNewlyAcquiredSlugs,
    openAuthModal,
  });

  const totalPacks = user ? packInventory.aficionado + packInventory.rojiblanco + packInventory.leyenda : 0;

  const handleCardPasted = useCallback((slug: string) => {
    setNewlyAcquiredSlugs((prev) => {
      if (!prev.has(slug)) return prev;
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }, []);

  const getCardStatus = useCallback(
    (slug: string) => {
      if (demoViewMode === "all-revealed") return { isOwned: true, quantity: Math.max(1, userInventory[slug] ?? 0) };
      if (demoViewMode === "all-hidden") return { isOwned: false, quantity: 0 };
      const qty = userInventory[slug] ?? 0;
      return { isOwned: qty > 0, quantity: qty };
    },
    [demoViewMode, userInventory]
  );

  const filteredGridCards = useMemo(
    () => sortGridCards(filterGridCards(allCards, gridFilterState, getCardStatus), gridFilterState.sortField, gridFilterState.sortDirection),
    [allCards, gridFilterState, getCardStatus]
  );

  const ownedCount = demoViewMode === "all-revealed" ? allCards.length : demoViewMode === "all-hidden" ? 0 : allCards.filter((c) => (userInventory[c.slug] ?? 0) > 0).length;
  const duplicateCount = demoViewMode === "all-hidden" ? 0 : Object.values(userInventory).reduce((acc, qty) => (qty > 1 ? acc + (qty - 1) : acc), 0);

  return (
    <div className="flex flex-col gap-6">
      {isDemo && user?.email && (
        <AlbumDemoToolbar
          userEmail={user.email}
          viewMode={demoViewMode}
          totalCards={allCards.length}
          onRevealAll={() => setDemoViewMode("all-revealed")}
          onHideAll={() => setDemoViewMode("all-hidden")}
          onResetStarter={() => setDemoViewMode("starter")}
          onAddPack={(t) => { setPackInventory(addPacksToInventory(t, 1, user.id)); toast.success(`${dict.games.album.toasts.demoPackAddedPrefix} ${t} ${dict.games.album.toasts.demoPackAddedSuffix}`); }}
          onClearPacks={() => { setPackInventory(clearUserPacks(user.id)); toast.info(dict.games.album.toasts.demoInventoryCleared); }}
        />
      )}
      <AlbumHeader ownedCount={ownedCount} totalCount={allCards.length} availablePacksCount={totalPacks} viewMode={viewMode} onViewModeChange={handleViewModeChange} />
      {viewMode === "packs" ? (
        <MyPacksView
          isAuthenticated={Boolean(user)}
          onOpenAuth={() => openAuthModal("signin")}
          packInventory={packInventory}
          missionState={missionState}
          duplicateCount={duplicateCount}
          onOpenPack={(t) => {
            if (!user) return openAuthModal("signin");
            const opened = handleOpenPackCards(t);
            if (!opened) return toast.error("No te quedan sobres disponibles de este tipo.");
            setSelectedPackTier(t);
            setActivePackData(opened);
            setIsPackModalOpen(true);
          }}
          onClaimLogin={handleClaimLogin}
          onClaimDailyGame={handleClaimDailyGame}
          onRecycleDuplicates={handleRecycle}
        />
      ) : viewMode === "album" ? (
        <AlbumSpreadView cards={allCards} getCardStatus={getCardStatus} newlyAcquiredSlugs={newlyAcquiredSlugs} onCardPasted={handleCardPasted} />
      ) : (
        <AlbumGridTabView filterState={gridFilterState} onFilterChange={setGridFilterState} duplicateCount={duplicateCount} filteredCards={filteredGridCards} getCardStatus={getCardStatus} />
      )}
      {isPackModalOpen && (
        <PackOpeningModal
          isOpen={isPackModalOpen}
          tier={selectedPackTier}
          initialPackData={activePackData}
          canOpenAnother={Boolean(user && packInventory[selectedPackTier] > 0)}
          onClose={() => setIsPackModalOpen(false)}
          onOpenPackCards={handleOpenPackCards}
          onSaveCards={() => toast.success(dict.games.album.toasts.cardsSaved)}
        />
      )}
    </div>
  );
}
