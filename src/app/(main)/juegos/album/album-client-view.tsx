"use client"; // Client: Gestión interactiva de colección, filtros de cuadrícula, inventario de sobres y pegado

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { generatePackCards } from "@/lib/cards/packs";
import {
  loadUserPackInventory,
  consumeUserPack,
  loadUserCardInventory,
  addCardsToInventory,
  addPacksToInventory,
  clearUserPacks,
  getDailyMissionState,
  claimDailyLoginPack,
  recycleDuplicates,
} from "@/lib/cards/pack-storage";
import {
  DEFAULT_GRID_FILTER_STATE,
  filterGridCards,
  sortGridCards,
  type GridFilterState,
} from "./grid-filter-types";

interface AlbumClientViewProps {
  readonly allCards: readonly Card[];
}

export function AlbumClientView({ allCards }: AlbumClientViewProps) {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [demoViewMode, setDemoViewMode] = useState<AlbumDemoViewMode>("starter");
  const [gridFilterState, setGridFilterState] = useState<GridFilterState>(DEFAULT_GRID_FILTER_STATE);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [selectedPackTier, setSelectedPackTier] = useState<PackTier>("aficionado");
  const [viewMode, setViewMode] = useState<AlbumViewMode>("album");
  const [newlyAcquiredSlugs, setNewlyAcquiredSlugs] = useState<Set<string>>(new Set());

  const [userInventory, setUserInventory] = useState(loadUserCardInventory);
  const [packInventory, setPackInventory] = useState(loadUserPackInventory);
  const [missionState, setMissionState] = useState(getDailyMissionState);

  useEffect(() => {
    const onPackSync = () => setPackInventory(loadUserPackInventory());
    const onCardSync = () => setUserInventory(loadUserCardInventory());
    window.addEventListener("mareona_pack_inventory_changed", onPackSync);
    window.addEventListener("mareona_card_inventory_changed", onCardSync);
    return () => {
      window.removeEventListener("mareona_pack_inventory_changed", onPackSync);
      window.removeEventListener("mareona_card_inventory_changed", onCardSync);
    };
  }, []);

  const totalPacks = packInventory.aficionado + packInventory.rojiblanco + packInventory.leyenda;

  const handleOpenPackCards = (tier: PackTier): Card[] => {
    consumeUserPack(tier);
    setPackInventory(loadUserPackInventory());
    const owned = new Set(Object.entries(userInventory).filter(([, q]) => q > 0).map(([s]) => s));
    return generatePackCards(tier, allCards, owned);
  };

  const handlePasteInAlbum = (acquiredCards: readonly Card[]) => {
    setUserInventory(addCardsToInventory(acquiredCards));
    setNewlyAcquiredSlugs(new Set(acquiredCards.map((c) => c.slug)));
    setViewMode("album");
    toast.success(`¡${acquiredCards.length} cromos pegados en tu álbum!`, {
      description: "Revisa las páginas correspondientes para ver tus nuevas joyas.",
    });
  };

  const handleClaimLogin = () => {
    const res = claimDailyLoginPack();
    if (res.success && res.tier) {
      setPackInventory(loadUserPackInventory());
      setMissionState(getDailyMissionState());
      toast.success("¡Recompensa diaria reclamada!", {
        description: `Has recibido 1 ${res.tier === "rojiblanco" ? "Sobre Rojiblanco" : "Sobre Aficionado"}.`,
      });
    }
  };

  const handleRecycle = () => {
    const res = recycleDuplicates();
    if (res.success) {
      setUserInventory(loadUserCardInventory());
      setPackInventory(loadUserPackInventory());
      toast.success("¡10 repetidos canjeados con éxito por 1 Sobre Rojiblanco!");
    } else {
      toast.error("No tienes suficientes repetidos (se requieren 10).");
    }
  };

  const getCardStatus = useCallback((slug: string) => {
    if (demoViewMode === "all-revealed") return { isOwned: true, quantity: Math.max(1, userInventory[slug] ?? 0) };
    if (demoViewMode === "all-hidden") return { isOwned: false, quantity: 0 };
    const qty = userInventory[slug] ?? 0;
    return { isOwned: qty > 0, quantity: qty };
  }, [demoViewMode, userInventory]);

  const filteredGridCards = useMemo(() => {
    const filtered = filterGridCards(allCards, gridFilterState, getCardStatus);
    return sortGridCards(filtered, gridFilterState.sortField, gridFilterState.sortDirection);
  }, [allCards, gridFilterState, getCardStatus]);

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
          onAddPack={(tier) => {
            const next = addPacksToInventory(tier, 1);
            setPackInventory(next);
            toast.success(`+1 Sobre ${tier} añadido a tu inventario.`);
          }}
          onClearPacks={() => {
            const next = clearUserPacks();
            setPackInventory(next);
            toast.info("Inventario de sobres vaciado.");
          }}
        />
      )}
      <AlbumHeader
        ownedCount={ownedCount}
        totalCount={allCards.length}
        availablePacksCount={totalPacks}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "packs" ? (
        <MyPacksView packInventory={packInventory} missionState={missionState} duplicateCount={duplicateCount} onOpenPack={(tier) => { setSelectedPackTier(tier); setIsPackModalOpen(true); }} onClaimLogin={handleClaimLogin} onRecycleDuplicates={handleRecycle} />
      ) : viewMode === "album" ? (
        <AlbumSpreadView cards={allCards} getCardStatus={getCardStatus} newlyAcquiredSlugs={newlyAcquiredSlugs} />
      ) : (
        <AlbumGridTabView filterState={gridFilterState} onFilterChange={setGridFilterState} duplicateCount={duplicateCount} filteredCards={filteredGridCards} getCardStatus={getCardStatus} />
      )}
      <PackOpeningModal
        isOpen={isPackModalOpen}
        tier={selectedPackTier}
        canOpenAnother={packInventory[selectedPackTier] > 0}
        onClose={() => setIsPackModalOpen(false)}
        onOpenPackCards={handleOpenPackCards}
        onPasteInAlbum={handlePasteInAlbum}
        ownedCardSlugs={new Set(Object.keys(userInventory))}
      />
    </div>
  );
}
