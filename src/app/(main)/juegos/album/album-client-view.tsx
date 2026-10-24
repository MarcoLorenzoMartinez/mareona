"use client"; // Client: Gestión interactiva de colección, filtros de cuadrícula y sobres

import { useState, useMemo, useCallback } from "react";
import type { Card } from "@/lib/cards/types";
import { useAuth } from "@/context/auth-context";
import { isDemoEmail } from "@/lib/auth/demo-credentials";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumHeader } from "./album-header";
import { AlbumDemoToolbar, type AlbumDemoViewMode } from "./album-demo-toolbar";
import { PackOpeningModal } from "./pack-opening-modal";
import { AlbumSpreadView } from "./album-spread-view";
import { GridFilterBar } from "./grid-filter-bar";
import {
  DEFAULT_GRID_FILTER_STATE,
  filterGridCards,
  sortGridCards,
  type GridFilterState,
} from "./grid-filter-types";

interface AlbumClientViewProps {
  readonly allCards: readonly Card[];
}

type ViewMode = "album" | "grid";

export function AlbumClientView({ allCards }: AlbumClientViewProps) {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [demoViewMode, setDemoViewMode] = useState<AlbumDemoViewMode>("starter");
  const [gridFilterState, setGridFilterState] = useState<GridFilterState>(DEFAULT_GRID_FILTER_STATE);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("album");
  const [newlyAcquiredSlugs, setNewlyAcquiredSlugs] = useState<Set<string>>(new Set());

  // Inicializamos al usuario con una baraja inicial auténtica de 6 cromos reales
  const [userInventory, setUserInventory] = useState<Record<string, number>>(() => {
    const starterSlugs = [
      "quini-1979",
      "joaquin-alonso-1985",
      "ablanedo-ii-1985",
      "david-villa-2002",
      "cote-2024",
      "gaspar-campos-2024",
    ];
    const initial: Record<string, number> = {};
    for (const slug of starterSlugs) {
      initial[slug] = 1;
    }
    return initial;
  });

  const handleOpenPack = (): Card[] => {
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    const packCards = shuffled.slice(0, 5);

    setUserInventory((prev) => {
      const next = { ...prev };
      for (const card of packCards) {
        next[card.slug] = (next[card.slug] ?? 0) + 1;
      }
      return next;
    });

    setNewlyAcquiredSlugs(new Set(packCards.map((c) => c.slug)));
    return packCards;
  };

  const getCardStatus = useCallback(
    (slug: string): { isOwned: boolean; quantity: number } => {
      if (demoViewMode === "all-revealed") {
        const rawQty = userInventory[slug] ?? 0;
        return { isOwned: true, quantity: rawQty > 1 ? rawQty : 1 };
      }
      if (demoViewMode === "all-hidden") {
        return { isOwned: false, quantity: 0 };
      }
      const qty = userInventory[slug] ?? 0;
      return { isOwned: qty > 0, quantity: qty };
    },
    [demoViewMode, userInventory]
  );

  const filteredGridCards = useMemo(() => {
    const filtered = filterGridCards(allCards, gridFilterState, getCardStatus);
    return sortGridCards(filtered, gridFilterState.sortField, gridFilterState.sortDirection);
  }, [allCards, gridFilterState, getCardStatus]);

  const ownedCount =
    demoViewMode === "all-revealed"
      ? allCards.length
      : demoViewMode === "all-hidden"
        ? 0
        : allCards.filter((c) => (userInventory[c.slug] ?? 0) > 0).length;

  const duplicateCount =
    demoViewMode === "all-hidden"
      ? 0
      : allCards.filter((c) => (userInventory[c.slug] ?? 0) > 1).length;

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
        />
      )}

      <AlbumHeader
        ownedCount={ownedCount}
        totalCount={allCards.length}
        onOpenPackClick={() => setIsPackModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "album" ? (
        <AlbumSpreadView
          cards={allCards}
          getCardStatus={getCardStatus}
          newlyAcquiredSlugs={newlyAcquiredSlugs}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <GridFilterBar
            filterState={gridFilterState}
            onFilterChange={setGridFilterState}
            duplicateCount={duplicateCount}
            totalFilteredCount={filteredGridCards.length}
          />

          {filteredGridCards.length > 0 ? (
            <section
              aria-label="Cuadrícula de Cromos en Propiedad"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 justify-items-center"
            >
              {filteredGridCards.map((card) => {
                const { quantity } = getCardStatus(card.slug);
                return (
                  <HistoricalCard
                    key={card.id}
                    card={card}
                    isOwned
                    quantity={quantity}
                    size="sm"
                  />
                );
              })}
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-neutral-50/50 py-12 px-4 text-center">
              <p className="text-sm font-bold text-neutral-800">
                No hay cromos que coincidan con los filtros seleccionados
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Prueba a seleccionar otras décadas, categorías o restablecer la valoración mínima.
              </p>
            </div>
          )}
        </div>
      )}

      <PackOpeningModal
        isOpen={isPackModalOpen}
        onClose={() => { setIsPackModalOpen(false); setNewlyAcquiredSlugs(new Set()); }}
        onOpenPack={handleOpenPack}
      />
    </div>
  );
}
