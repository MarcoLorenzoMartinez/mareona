"use client"; // Client: Pestaña de visualización de cromos en cuadrícula con filtros avanzados

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { GridFilterBar } from "./grid-filter-bar";
import type { GridFilterState } from "./grid-filter-types";

interface AlbumGridTabViewProps {
  readonly filterState: GridFilterState;
  readonly onFilterChange: (state: GridFilterState) => void;
  readonly duplicateCount: number;
  readonly filteredCards: readonly Card[];
  readonly getCardStatus: (slug: string) => { isOwned: boolean; quantity: number };
}

/**
 * Grid view tab displaying all cards owned or filtered in the user's collection.
 */
export function AlbumGridTabView({
  filterState,
  onFilterChange,
  duplicateCount,
  filteredCards,
  getCardStatus,
}: AlbumGridTabViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <GridFilterBar
        filterState={filterState}
        onFilterChange={onFilterChange}
        duplicateCount={duplicateCount}
        totalFilteredCount={filteredCards.length}
      />

      {filteredCards.length > 0 ? (
        <section
          aria-label="Cuadrícula de Cromos en Propiedad"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 justify-items-center"
        >
          {filteredCards.map((card) => {
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
  );
}
