"use client"; // Client: Orquestador del álbum físico con paginación cronológica y animación de pase

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumCardSlot } from "./album-card-slot";
import { AlbumPastedCard } from "./album-pasted-card";
import { AlbumChapterTabs } from "./album-chapter-tabs";
import { AlbumBookSpread } from "./album-book-spread";
import { AlbumPageNav } from "./album-page-nav";
import {
  CARDS_PER_PAGE,
  sortCardsChronologically,
  paginateCards,
  computeAlbumChapters,
} from "./album-types";

interface AlbumSpreadViewProps {
  readonly cards: readonly Card[];
  readonly getCardStatus: (slug: string) => { isOwned: boolean; quantity: number };
  readonly newlyAcquiredSlugs?: ReadonlySet<string>;
}

export function AlbumSpreadView({
  cards,
  getCardStatus,
  newlyAcquiredSlugs = new Set(),
}: AlbumSpreadViewProps) {
  const sortedCards = useMemo(() => sortCardsChronologically(cards), [cards]);
  const pages = useMemo(() => paginateCards(sortedCards, CARDS_PER_PAGE), [sortedCards]);
  const chapters = useMemo(() => computeAlbumChapters(pages), [pages]);

  const [currentPage, setCurrentPage] = useState(1);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev" | "none">("none");
  const touchStartX = useRef<number | null>(null);

  const totalPages = Math.max(1, pages.length);

  // Clamps page and triggers realistic directional animation
  const handleTurnToPage = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(totalPages, target));
      if (clamped === currentPage) return;
      setTurnDirection(clamped > currentPage ? "next" : "prev");
      setCurrentPage(clamped);
    },
    [currentPage, totalPages]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleTurnToPage(e.shiftKey ? currentPage - 5 : currentPage - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleTurnToPage(e.shiftKey ? currentPage + 5 : currentPage + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        handleTurnToPage(1);
      } else if (e.key === "End") {
        e.preventDefault();
        handleTurnToPage(totalPages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, handleTurnToPage]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleTurnToPage(currentPage + 1); // Swipe left -> Next
      else handleTurnToPage(currentPage - 1); // Swipe right -> Prev
    }
    touchStartX.current = null;
  };

  const pageCards = pages[currentPage - 1] ?? [];
  const currentChapter = chapters.find(
    (c) => currentPage >= c.startPage && currentPage <= c.endPage
  );

  const ownedOnPage = pageCards.filter((c) => getCardStatus(c.slug).isOwned).length;
  const pageProgress = pageCards.length > 0 ? ownedOnPage / pageCards.length : 0;

  // Fill up to CARDS_PER_PAGE so every page has identical visual dimensions
  const slotCount = CARDS_PER_PAGE;
  const slots = Array.from({ length: slotCount });

  return (
    <div
      className="flex flex-col gap-3 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Chapter bookmark tabs across top */}
      <AlbumChapterTabs
        chapters={chapters}
        currentPage={currentPage}
        onSelectPage={handleTurnToPage}
      />

      {/* 2. Physical Book hardcover with single spread and 3D turn */}
      <AlbumBookSpread
        pageNumber={currentPage}
        totalPages={totalPages}
        pageTitle={currentChapter?.label ?? "Colección de Cromos"}
        pageSubtitle={currentChapter?.eraSubtitle}
        progress={pageProgress}
        turnDirection={turnDirection}
        onPrevPage={() => handleTurnToPage(currentPage - 1)}
        onNextPage={() => handleTurnToPage(currentPage + 1)}
        canPrev={currentPage > 1}
        canNext={currentPage < totalPages}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {slots.map((_, idx) => {
            const card = pageCards[idx];
            const globalNumber = (currentPage - 1) * CARDS_PER_PAGE + idx + 1;

            if (!card) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="flex aspect-[63/90] w-full h-full flex-col items-center justify-center rounded-none border border-dashed border-amber-800/25 bg-amber-950/5 p-2 text-center"
                >
                  <span className="text-[7.5px] font-bold text-amber-800/40 uppercase tracking-widest">
                    Casilla #{globalNumber}
                  </span>
                </div>
              );
            }

            const { isOwned, quantity } = getCardStatus(card.slug);
            const isNew = newlyAcquiredSlugs.has(card.slug);

            return (
              <div key={card.id} className="relative w-full aspect-[63/90]">
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
      </AlbumBookSpread>

      {/* 3. Slider deslizador de páginas debajo del álbum */}
      <AlbumPageNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleTurnToPage}
      />
    </div>
  );
}
