"use client"; // Client: Página individual del álbum con cabecera, cuadrícula de 9 cromos (3x3) y pie

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumCardSlot } from "./album-card-slot";
import { AlbumPastedCard } from "./album-pasted-card";
import { CARDS_PER_PAGE } from "./album-types";

interface AlbumPageSectionProps {
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly pageTitle: string;
  readonly pageSubtitle?: string;
  readonly cards: readonly Card[];
  readonly getCardStatus: (slug: string) => { isOwned: boolean; quantity: number };
  readonly newlyAcquiredSlugs?: ReadonlySet<string>;
}

/**
 * Renders a single page face inside the physical album spread.
 * Features an editorial header, a 3x3 grid of 9 cards, and a printed footer.
 */
export function AlbumPageSection({
  pageNumber,
  totalPages,
  pageTitle,
  pageSubtitle,
  cards,
  getCardStatus,
  newlyAcquiredSlugs = new Set(),
}: AlbumPageSectionProps) {
  const ownedOnPage = cards.filter((c) => getCardStatus(c.slug).isOwned).length;
  const pageProgress = cards.length > 0 ? Math.round((ownedOnPage / cards.length) * 100) : 0;
  const slots = Array.from({ length: CARDS_PER_PAGE });

  return (
    <div className="flex h-full flex-col justify-between select-none">
      {/* Cabecera de la página */}
      <header className="flex items-start justify-between border-b border-amber-800/15 pb-1 sm:pb-1.5 mb-1.5 sm:mb-2">
        <div className="min-w-0 pr-2">
          <h3
            className="truncate font-sans text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-amber-950/85"
            style={{ textShadow: "0 1px 0 rgba(255,250,235,0.8)" }}
          >
            {pageTitle}
          </h3>
          {pageSubtitle && (
            <p className="truncate text-[8px] sm:text-[9.5px] font-semibold uppercase tracking-wider text-amber-900/60">
              {pageSubtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="font-sans text-[9px] sm:text-[10px] font-black tabular-nums text-amber-950/85">
            Pág. {pageNumber} de {totalPages}
          </span>
          <span className="text-[8px] sm:text-[8.5px] font-bold text-amber-900/60 tabular-nums">
            {pageProgress}%
          </span>
        </div>
      </header>

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
                <AlbumPastedCard isNew={isNew}>
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
