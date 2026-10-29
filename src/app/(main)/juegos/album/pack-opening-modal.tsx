"use client"; // Client: Modal de apertura progresiva de sobre estilo FUT (rasgado, teaser y reveal)

import { useState, useTransition } from "react";
import type { Card, PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";
import { PackSealedView } from "./pack-sealed-view";
import { PackTeaserView } from "./pack-teaser-view";
import { PackRevealCard } from "./pack-reveal-card";
import { PackSummaryGrid } from "./pack-summary-grid";

interface PackOpeningModalProps {
  readonly isOpen: boolean;
  readonly tier: PackTier;
  readonly canOpenAnother?: boolean;
  readonly onClose: () => void;
  readonly onOpenPackCards: (tier: PackTier) => Card[];
  readonly onPasteInAlbum: (acquiredCards: readonly Card[]) => void;
  readonly ownedCardSlugs: ReadonlySet<string>;
}

type ModalStage = "sealed" | "tearing" | "teaser" | "revealing" | "summary";

export function PackOpeningModal({
  isOpen,
  tier,
  canOpenAnother = false,
  onClose,
  onOpenPackCards,
  onPasteInAlbum,
  ownedCardSlugs,
}: PackOpeningModalProps) {
  const [, startTransition] = useTransition();
  const [stage, setStage] = useState<ModalStage>("sealed");
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const config = PACK_TIERS[tier];
  const currentCard = cards[currentIndex];
  const starCard = cards.find((c) => (c.ovr ?? 0) >= 82);

  const handleTearAndOpen = () => {
    setStage("tearing");
    const generated = onOpenPackCards(tier);
    setCards(generated);
    setCurrentIndex(0);
    setFlippedIndices(new Set());

    setTimeout(() => {
      startTransition(() => {
        const hasLegend = generated.some((c) => (c.ovr ?? 0) >= 82);
        setStage(hasLegend ? "teaser" : "revealing");
      });
    }, 450);
  };

  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStage("summary");
    }
  };

  const handleModalClose = () => {
    setStage("sealed");
    setCards([]);
    setCurrentIndex(0);
    setFlippedIndices(new Set());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pack-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none"
    >
      <div className="relative flex w-full max-w-2xl flex-col items-center rounded-3xl border border-[var(--border)] bg-white p-6 shadow-2xl overflow-hidden">
        {/* Cabecera del modal */}
        <div className="flex w-full items-center justify-between border-b border-[var(--border)] pb-3">
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#e2001a]">
            {config.name}
          </span>
          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Cerrar modal"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 1. Estado Sellado & Rasgado */}
        {(stage === "sealed" || stage === "tearing") && (
          <PackSealedView
            config={config}
            isTearing={stage === "tearing"}
            onTear={handleTearAndOpen}
          />
        )}

        {/* 2. Teaser de Carta Estrella */}
        {stage === "teaser" && starCard && (
          <PackTeaserView
            starCard={starCard}
            onDiscover={() => setStage("revealing")}
          />
        )}

        {/* 3. Revelación Progresiva Carta a Carta */}
        {stage === "revealing" && currentCard && (
          <div className="my-4 flex flex-col items-center">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-neutral-100 px-3 py-0.5 font-sans text-xs font-bold tabular-nums text-neutral-600">
                Carta {currentIndex + 1} de {cards.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFlippedIndices(new Set(cards.map((_, idx) => idx)));
                  setStage("summary");
                }}
                className="text-xs font-bold text-neutral-400 hover:text-neutral-700 underline"
              >
                Saltar al resumen
              </button>
            </div>

            <PackRevealCard
              card={currentCard}
              isNew={!ownedCardSlugs.has(currentCard.slug)}
              isFlipped={flippedIndices.has(currentIndex)}
              onFlip={() => setFlippedIndices((prev) => new Set([...prev, currentIndex]))}
            />

            <div className="mt-4 flex gap-3">
              {!flippedIndices.has(currentIndex) ? (
                <button
                  type="button"
                  onClick={() => setFlippedIndices((prev) => new Set([...prev, currentIndex]))}
                  className="rounded-full bg-[#e2001a] px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-95 cursor-pointer"
                >
                  Voltear cromo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextCard}
                  className="rounded-full bg-neutral-900 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 active:scale-95 cursor-pointer"
                >
                  {currentIndex + 1 < cards.length ? "Siguiente carta →" : "Ver resumen"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Resumen Final */}
        {stage === "summary" && (
          <PackSummaryGrid
            cards={cards}
            newCardSlugs={new Set(cards.filter((c) => !ownedCardSlugs.has(c.slug)).map((c) => c.slug))}
            onPasteInAlbum={() => {
              onPasteInAlbum(cards);
              handleModalClose();
            }}
            onOpenAnother={handleTearAndOpen}
            canOpenAnother={canOpenAnother}
          />
        )}
      </div>
    </div>
  );
}
