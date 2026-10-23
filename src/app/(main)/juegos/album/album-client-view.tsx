"use client"; // Client: Gestión interactiva de colección, filtros de décadas y sobres

import { useState } from "react";
import type { Card } from "@/lib/cards/types";
import { useAuth } from "@/context/auth-context";
import { isDemoEmail } from "@/lib/auth/demo-credentials";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumHeader, type AlbumFilter } from "./album-header";
import { AlbumDemoToolbar, type AlbumDemoViewMode } from "./album-demo-toolbar";
import { PackOpeningModal } from "./pack-opening-modal";
import { AlbumSpreadView } from "./album-spread-view";

interface AlbumClientViewProps {
  readonly allCards: readonly Card[];
}

type ViewMode = "album" | "grid";

export function AlbumClientView({ allCards }: AlbumClientViewProps) {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [demoViewMode, setDemoViewMode] = useState<AlbumDemoViewMode>("starter");
  const [selectedFilter, setSelectedFilter] = useState<AlbumFilter>("all");
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
    // Escoger 5 cartas aleatorias de la baraja con probabilidad uniforme
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    const packCards = shuffled.slice(0, 5);

    setUserInventory((prev) => {
      const next = { ...prev };
      for (const card of packCards) {
        next[card.slug] = (next[card.slug] ?? 0) + 1;
      }
      return next;
    });

    // Track newly acquired cards for the paste animation in album view
    setNewlyAcquiredSlugs(new Set(packCards.map((c) => c.slug)));

    return packCards;
  };

  const getCardStatus = (slug: string): { isOwned: boolean; quantity: number } => {
    if (demoViewMode === "all-revealed") {
      const rawQty = userInventory[slug] ?? 0;
      return { isOwned: true, quantity: rawQty > 1 ? rawQty : 1 };
    }
    if (demoViewMode === "all-hidden") {
      return { isOwned: false, quantity: 0 };
    }
    const qty = userInventory[slug] ?? 0;
    return { isOwned: qty > 0, quantity: qty };
  };

  const filteredCards = allCards.filter((card) => {
    if (selectedFilter === "duplicates") {
      const { quantity } = getCardStatus(card.slug);
      return quantity > 1;
    }
    if (selectedFilter === "crests") return card.kind === "crest";
    if (selectedFilter === "moments") return card.kind === "moment";
    if (selectedFilter === "coaches") return card.kind === "coach";
    if (selectedFilter === "all") return true;
    return card.decade === selectedFilter;
  });

  const ownedGridCards = filteredCards.filter((card) => getCardStatus(card.slug).isOwned);

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
      {/* Barra de herramientas para cuentas de evaluación Demo */}
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
        selectedFilter={selectedFilter}
        onSelectFilter={(f) => { setSelectedFilter(f); }}
        ownedCount={ownedCount}
        totalCount={allCards.length}
        duplicateCount={duplicateCount}
        onOpenPackClick={() => setIsPackModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Vista Álbum (pliegos físicos de papel) */}
      {viewMode === "album" ? (
        <AlbumSpreadView
          cards={allCards}
          getCardStatus={getCardStatus}
          newlyAcquiredSlugs={newlyAcquiredSlugs}
        />
      ) : (
        /* Vista Cuadrícula: exclusivamente cartas conseguidas */
        ownedGridCards.length > 0 ? (
          <section
            aria-label="Cuadrícula de Cromos en Propiedad"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 justify-items-center"
          >
            {ownedGridCards.map((card) => {
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
              {selectedFilter === "duplicates"
                ? "No tienes cromos duplicados en este momento"
                : "Aún no tienes cromos en esta categoría"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {selectedFilter === "duplicates"
                ? "Abre nuevos sobres para conseguir cartas repetidas y compartirlas."
                : "Abre nuevos sobres para desbloquear cartas de esta categoría."}
            </p>
          </div>
        )
      )}

      {/* Modal Interactivo de Apertura de Sobres */}
      <PackOpeningModal
        isOpen={isPackModalOpen}
        onClose={() => { setIsPackModalOpen(false); setNewlyAcquiredSlugs(new Set()); }}
        onOpenPack={handleOpenPack}
      />
    </div>
  );
}
