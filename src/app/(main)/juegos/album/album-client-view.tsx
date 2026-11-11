"use client"; // Client: Gestión interactiva de colección, filtros, inventario de sobres y pegado

import { useState, useEffect, useMemo, useCallback } from "react";
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
  const { user, openAuthModal } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [demoViewMode, setDemoViewMode] = useState<AlbumDemoViewMode>("starter");
  const [gridFilterState, setGridFilterState] = useState<GridFilterState>(DEFAULT_GRID_FILTER_STATE);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [selectedPackTier, setSelectedPackTier] = useState<PackTier>("aficionado");
  const [viewMode, setViewMode] = useState<AlbumViewMode>("album");
  const [newlyAcquiredSlugs, setNewlyAcquiredSlugs] = useState<Set<string>>(new Set());

  const {
    userInventory,
    setUserInventory,
    packInventory,
    setPackInventory,
    missionState,
    setMissionState,
  } = useAlbumInventory(user?.id);

  // Aprovisionamiento automático de lote de sobres para cuentas evaluadoras
  useEffect(() => {
    if (user?.id && isDemo) {
      const seededKey = `mareona_tester_packs_seeded_${user.id}`;
      if (!window.localStorage.getItem(seededKey)) {
        addPacksToInventory("aficionado", 3, user.id);
        addPacksToInventory("rojiblanco", 3, user.id);
        addPacksToInventory("leyenda", 3, user.id);
        setPackInventory(loadUserPackInventory(user.id));
        window.localStorage.setItem(seededKey, "true");
        toast.success("¡Lote de prueba otorgado!", {
          description: "3 sobres Aficionado, 3 Rojiblanco y 3 Leyenda añadidos a tu cuenta.",
        });
      }
    }
  }, [user, isDemo, setPackInventory]);

  const totalPacks = user
    ? packInventory.aficionado + packInventory.rojiblanco + packInventory.leyenda
    : 2;

  const handleOpenPackCards = useCallback((tier: PackTier): Card[] => {
    if (!user?.id) return [];
    consumeUserPack(tier, user.id);
    setPackInventory(loadUserPackInventory(user.id));
    const owned = new Set(Object.entries(userInventory).filter(([, q]) => q > 0).map(([s]) => s));
    const generated = generatePackCards(tier, allCards, owned);
    const nextInventory = addCardsToInventory(generated, user.id);
    setUserInventory(nextInventory);
    setNewlyAcquiredSlugs(new Set(generated.map((c) => c.slug)));
    return generated;
  }, [allCards, user, userInventory, setPackInventory, setUserInventory]);

  const handleClaimLogin = () => {
    if (!user) return openAuthModal("signin");
    const res = claimDailyLoginPack(user.id);
    if (res.success && res.tier) {
      setPackInventory(loadUserPackInventory(user.id));
      setMissionState(getDailyMissionState(undefined, user.id));
      toast.success("¡Recompensa diaria reclamada!", {
        description: `Has recibido 1 ${res.tier === "rojiblanco" ? "Sobre Rojiblanco" : "Sobre Aficionado"}.`,
      });
    }
  };

  const handleRecycle = () => {
    if (!user) return openAuthModal("signin");
    const res = recycleDuplicates(user.id);
    if (res.success) {
      setUserInventory(loadUserCardInventory(user.id));
      setPackInventory(loadUserPackInventory(user.id));
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
          onAddPack={(t) => { setPackInventory(addPacksToInventory(t, 1, user.id)); toast.success(`+1 Sobre ${t} añadido.`); }}
          onClearPacks={() => { setPackInventory(clearUserPacks(user.id)); toast.info("Inventario vaciado."); }}
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
        <MyPacksView
          isAuthenticated={Boolean(user)}
          onOpenAuth={() => openAuthModal("signin")}
          packInventory={packInventory}
          missionState={missionState}
          duplicateCount={duplicateCount}
          onOpenPack={(t) => { if (!user) return openAuthModal("signin"); setSelectedPackTier(t); setIsPackModalOpen(true); }}
          onClaimLogin={handleClaimLogin}
          onRecycleDuplicates={handleRecycle}
        />
      ) : viewMode === "album" ? (
        <AlbumSpreadView cards={allCards} getCardStatus={getCardStatus} newlyAcquiredSlugs={newlyAcquiredSlugs} />
      ) : (
        <AlbumGridTabView filterState={gridFilterState} onFilterChange={setGridFilterState} duplicateCount={duplicateCount} filteredCards={filteredGridCards} getCardStatus={getCardStatus} />
      )}
      {isPackModalOpen && (
        <PackOpeningModal
          isOpen={isPackModalOpen}
          tier={selectedPackTier}
          canOpenAnother={Boolean(user && packInventory[selectedPackTier] > 0)}
          onClose={() => setIsPackModalOpen(false)}
          onOpenPackCards={handleOpenPackCards}
          onSaveCards={() => toast.success("Cromos guardados en tu álbum")}
          ownedCardSlugs={new Set(Object.keys(userInventory))}
        />
      )}
    </div>
  );
}
