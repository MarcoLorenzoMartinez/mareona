"use client"; // Client: Orquestador del álbum físico con pliego abierto (9 cromos a la izquierda y 9 a la derecha)

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Card } from "@/lib/cards/types";
import { AlbumChapterTabs } from "./album-chapter-tabs";
import { AlbumBookSpread } from "./album-book-spread";
import { AlbumPageSection } from "./album-page-section";
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

  // Calcula las páginas izquierda y derecha del pliego abierto
  const leftPageNum = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
  const rightPageNum = Math.min(totalPages, leftPageNum + 1);

  const handleTurnToPage = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(totalPages, target));
      if (clamped === currentPage) return;
      setTurnDirection(clamped > currentPage ? "next" : "prev");
      setCurrentPage(clamped);
    },
    [currentPage, totalPages]
  );

  // Atajos de teclado para hojear el álbum físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleTurnToPage(e.shiftKey ? Math.max(1, leftPageNum - 10) : Math.max(1, leftPageNum - 2));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleTurnToPage(e.shiftKey ? Math.min(totalPages, leftPageNum + 10) : Math.min(totalPages, leftPageNum + 2));
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
  }, [leftPageNum, totalPages, handleTurnToPage]);

  const leftCards = pages[leftPageNum - 1] ?? [];
  const rightCards = pages[rightPageNum - 1] ?? [];

  const leftChapter = chapters.find(
    (c) => leftPageNum >= c.startPage && leftPageNum <= c.endPage
  );
  const rightChapter = chapters.find(
    (c) => rightPageNum >= c.startPage && rightPageNum <= c.endPage
  );

  const canPrev = leftPageNum > 1;
  const canNext = rightPageNum < totalPages;

  return (
    <div
      className="flex flex-col gap-3 select-none"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) handleTurnToPage(Math.min(totalPages, leftPageNum + 2));
          else handleTurnToPage(Math.max(1, leftPageNum - 2));
        }
        touchStartX.current = null;
      }}
    >
      {/* 1. Pestañas de capítulos cronológicos */}
      <AlbumChapterTabs
        chapters={chapters}
        currentPage={leftPageNum}
        onSelectPage={handleTurnToPage}
      />

      {/* 2. Pliego físico abierto del álbum (9 cromos a la izquierda y 9 a la derecha) */}
      <AlbumBookSpread
        pageNumber={leftPageNum}
        totalPages={totalPages}
        turnDirection={turnDirection}
        onPrevPage={() => handleTurnToPage(Math.max(1, leftPageNum - 2))}
        onNextPage={() => handleTurnToPage(Math.min(totalPages, leftPageNum + 2))}
        canPrev={canPrev}
        canNext={canNext}
        leftPage={
          <AlbumPageSection
            pageNumber={leftPageNum}
            totalPages={totalPages}
            pageTitle={leftChapter?.label ?? "Colección de Cromos"}
            pageSubtitle={leftChapter?.eraSubtitle}
            cards={leftCards}
            getCardStatus={getCardStatus}
            newlyAcquiredSlugs={newlyAcquiredSlugs}
          />
        }
        rightPage={
          <AlbumPageSection
            pageNumber={rightPageNum}
            totalPages={totalPages}
            pageTitle={rightChapter?.label ?? "Colección de Cromos"}
            pageSubtitle={rightChapter?.eraSubtitle}
            cards={rightCards}
            getCardStatus={getCardStatus}
            newlyAcquiredSlugs={newlyAcquiredSlugs}
          />
        }
      />

      {/* 3. Riel deslizador antiguo debajo del álbum */}
      <AlbumPageNav
        currentPage={leftPageNum}
        totalPages={totalPages}
        onPageChange={handleTurnToPage}
        label={
          leftPageNum === rightPageNum
            ? `Página ${leftPageNum} de ${totalPages}`
            : `Páginas ${leftPageNum}–${rightPageNum} de ${totalPages}`
        }
      />
    </div>
  );
}
