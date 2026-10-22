"use client"; // Client: Gestión interactiva de colección, filtros de décadas y sobres

import { useState } from "react";
import type { Card, CardDecade } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumHeader } from "./album-header";
import { PackOpeningModal } from "./pack-opening-modal";

interface AlbumClientViewProps {
  readonly allCards: readonly Card[];
}

export function AlbumClientView({ allCards }: AlbumClientViewProps) {
  const [selectedDecade, setSelectedDecade] = useState<CardDecade | "all">("all");
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

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

    return packCards;
  };

  const filteredCards = allCards.filter((card) => {
    if (selectedDecade === "all") return true;
    return card.decade === selectedDecade;
  });

  const ownedCount = allCards.filter((c) => (userInventory[c.slug] ?? 0) > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <AlbumHeader
        selectedDecade={selectedDecade}
        onSelectDecade={setSelectedDecade}
        ownedCount={ownedCount}
        totalCount={allCards.length}
        onOpenPackClick={() => setIsPackModalOpen(true)}
      />

      {/* Cuadrícula Responsiva de Cromos */}
      <section
        aria-label="Cuadrícula del Álbum de Cromos"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 justify-items-center"
      >
        {filteredCards.map((card) => {
          const qty = userInventory[card.slug] ?? 0;
          const isOwned = qty > 0;
          return (
            <HistoricalCard
              key={card.id}
              card={card}
              isOwned={isOwned}
              quantity={qty}
              size="sm"
            />
          );
        })}
      </section>

      {/* Modal Interactivo de Apertura de Sobres */}
      <PackOpeningModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        onOpenPack={handleOpenPack}
      />
    </div>
  );
}
