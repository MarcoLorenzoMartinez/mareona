"use client"; // Client: Página individual del álbum con cabecera, cuadrícula de 9 cromos (3x3) y pie

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumCardSlot } from "./album-card-slot";
import { AlbumPastedCard } from "./album-pasted-card";
import { CARDS_PER_PAGE } from "./album-types";

interface AlbumPageSectionProps {
  readonly pageNumber: number;
  readonly totalPages?: number;
  readonly pageTitle: string;
  readonly showHeaderTitle?: boolean;
  readonly cards: readonly Card[];
  readonly getCardStatus: (slug: string) => { isOwned: boolean; quantity: number };
  readonly newlyAcquiredSlugs?: ReadonlySet<string>;
  readonly onCardPasted?: (slug: string) => void;
}

/**
 * Renders a single page face inside the physical album spread.
 * Features an editorial header, a 3x3 grid of 9 cards, and a printed footer.
 */
export function AlbumPageSection({
  pageNumber,
  pageTitle,
  showHeaderTitle = true,
  cards,
  getCardStatus,
  newlyAcquiredSlugs = new Set(),
  onCardPasted,
}: AlbumPageSectionProps) {
  const slots = Array.from({ length: CARDS_PER_PAGE });

  return (
    <div className="flex h-full flex-col justify-between select-none">
      {/* Cabecera de la página: solo título de la sección en la parte superior izquierda */}
      {showHeaderTitle ? (
        <header className="flex h-6 items-center border-b border-amber-800/15 mb-2 sm:mb-2.5">
          <h3
            className="truncate font-sans text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-amber-950/85"
            style={{ textShadow: "0 1px 0 rgba(255,250,235,0.8)" }}
          >
            {pageTitle}
          </h3>
        </header>
      ) : (
        <div
          className="h-6 border-b border-amber-800/15 mb-2 sm:mb-2.5"
          aria-hidden="true"
        />
      )}

      {/* Cuadrícula de 9 cromos: 3 columnas x 3 filas */}
      <div className="my-auto grid grid-cols-3 gap-1.5 sm:gap-2">
        {slots.map((_, idx) => {
          const card = cards[idx];
          const globalNumber = (pageNumber - 1) * CARDS_PER_PAGE + idx + 1;

          if (!card) {
            return (
              <div
                key={`empty-${idx}`}
                className="flex aspect-[63/90] w-full items-center justify-center border border-dashed border-amber-800/25 bg-amber-950/5 p-1 text-center"
              >
                <span className="text-[7px] font-bold uppercase tracking-widest text-amber-800/40">
                  Casilla #{globalNumber}
                </span>
              </div>
            );
          }

          const { isOwned, quantity } = getCardStatus(card.slug);
          const isNew = newlyAcquiredSlugs.has(card.slug);

          return (
            <div key={card.id} className="relative aspect-[63/90] w-full">
              {isOwned ? (
                <AlbumPastedCard
                  isNew={isNew}
                  onPasted={isNew && onCardPasted ? () => onCardPasted(card.slug) : undefined}
                >
                  <HistoricalCard
                    card={card}
                    isOwned
                    quantity={quantity}
                    size="fill"
                  />
                </AlbumPastedCard>
              ) : (
                <AlbumCardSlot card={card} cardNumber={globalNumber} />
              )}
            </div>
          );
        })}
      </div>

      {/* Pie de página impreso */}
      <footer
        aria-hidden="true"
        className="flex items-center justify-between border-t border-amber-800/10 pt-1 mt-1.5 text-[7.5px] font-bold uppercase tracking-widest text-amber-900/40"
      >
        <span>Real Sporting · Colección Oficial</span>
        <span>Pág. {pageNumber}</span>
      </footer>
    </div>
  );
}
