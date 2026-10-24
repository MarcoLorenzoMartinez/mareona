"use client"; // Client: Orquestador del álbum físico con pliego abierto (9 cromos a la izquierda y 9 a la derecha)

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Card } from "@/lib/cards/types";
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
  const [isDoublePage, setIsDoublePage] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalPages = Math.max(1, pages.length);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDoublePage(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const step = isDoublePage ? 2 : 1;
  const leftPageNum = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
  const rightPageNum = Math.min(totalPages, leftPageNum + 1);
  const activePage = isDoublePage ? leftPageNum : currentPage;

  const handleTurnToPage = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(totalPages, target));
      if (clamped === currentPage) return;
      setTurnDirection(clamped > currentPage ? "next" : "prev");
      setCurrentPage(clamped);
    },
    [currentPage, totalPages]
  );

  // Atajos de teclado para hojear el álbum físico (1 página en móvil, 2 en escritorio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleTurnToPage(e.shiftKey ? activePage - (isDoublePage ? 10 : 5) : activePage - step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleTurnToPage(e.shiftKey ? activePage + (isDoublePage ? 10 : 5) : activePage + step);
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
  }, [activePage, step, isDoublePage, totalPages, handleTurnToPage]);

  const getChapter = (p: number) => chapters.find((c) => p >= c.startPage && p <= c.endPage);
  const leftChapter = getChapter(leftPageNum);
  const rightChapter = getChapter(rightPageNum);
  const mobileChapter = getChapter(currentPage);

  const leftCards = pages[leftPageNum - 1] ?? [];
  const rightCards = pages[rightPageNum - 1] ?? [];
  const mobileCards = pages[currentPage - 1] ?? [];

  const canPrev = isDoublePage ? leftPageNum > 1 : currentPage > 1;
  const canNext = isDoublePage ? rightPageNum < totalPages : currentPage < totalPages;
  const navLabel =
    isDoublePage && leftPageNum !== rightPageNum
      ? `Páginas ${leftPageNum}–${rightPageNum} de ${totalPages}`
      : `Página ${activePage} de ${totalPages}`;

  return (
    <div
      className="flex flex-col select-none"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          handleTurnToPage(diff > 0 ? activePage + step : activePage - step);
        }
        touchStartX.current = null;
      }}
    >
      {/* Pliego físico abierto del álbum (1 página en móvil, 2 en escritorio) */}
      <AlbumBookSpread
        pageNumber={activePage}
        totalPages={totalPages}
        turnDirection={turnDirection}
        onPrevPage={() => handleTurnToPage(activePage - step)}
        onNextPage={() => handleTurnToPage(activePage + step)}
        canPrev={canPrev}
        canNext={canNext}
        leftPage={
          <AlbumPageSection
            pageNumber={leftPageNum}
            totalPages={totalPages}
            pageTitle={leftChapter?.label ?? "Colección de Cromos"}
            showHeaderTitle={true}
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
            showHeaderTitle={false}
            cards={rightCards}
            getCardStatus={getCardStatus}
            newlyAcquiredSlugs={newlyAcquiredSlugs}
          />
        }
        mobilePage={
          <AlbumPageSection
            pageNumber={currentPage}
            totalPages={totalPages}
            pageTitle={mobileChapter?.label ?? "Colección de Cromos"}
            showHeaderTitle={true}
            cards={mobileCards}
            getCardStatus={getCardStatus}
            newlyAcquiredSlugs={newlyAcquiredSlugs}
          />
        }
      />

      {/* 3. Riel deslizador antiguo debajo del álbum */}
      <div className="mt-4">
        <AlbumPageNav
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={handleTurnToPage}
          label={navLabel}
        />
      </div>
    </div>
  );
}
