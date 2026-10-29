"use client"; // Client: Modal de apertura de sobre integrado en el diseño claro y sobrio de Mareona

import { useState, useEffect, useRef, useCallback } from "react";
import type { Card, PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";
import { PackRowCard } from "./pack-row-card";
import { PackModalActionsBar } from "./pack-modal-actions-bar";

interface PackOpeningModalProps {
  readonly isOpen: boolean;
  readonly tier: PackTier;
  readonly canOpenAnother?: boolean;
  readonly onClose: () => void;
  readonly onOpenPackCards: (tier: PackTier) => Card[];
  readonly onPasteInAlbum: (acquiredCards: readonly Card[]) => void;
  readonly ownedCardSlugs: ReadonlySet<string>;
}

/**
 * Clean, modern pack opening modal adhering to AGENTS.md:
 * - Pure white background (#ffffff) with subtle border, zero AI dark-template styling.
 * - Cards displayed side-by-side using the canonical CardBack before reveal.
 * - Smooth progressive reveal from left to right.
 */
export function PackOpeningModal({
  isOpen,
  tier,
  canOpenAnother = false,
  onClose,
  onOpenPackCards,
  onPasteInAlbum,
  ownedCardSlugs,
}: PackOpeningModalProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRevealSequence = useCallback((cardsCount: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    let step = 0;
    const tick = () => {
      step += 1;
      setRevealedCount(step);
      if (step < cardsCount) {
        timerRef.current = setTimeout(tick, 900);
      }
    };
    timerRef.current = setTimeout(tick, 500);
  }, []);

  // Genera las cartas y arranca la secuencia exactamente una vez al abrir el modal
  useEffect(() => {
    if (!isOpen) {
      setCards([]);
      setRevealedCount(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Se consume e invoca exactamente un sobre al abrir
    const generated = onOpenPackCards(tier);
    setCards(generated);
    setRevealedCount(0);
    startRevealSequence(generated.length);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const config = PACK_TIERS[tier];
  const allRevealed = cards.length > 0 && revealedCount >= cards.length;
  const newCardsCount = cards.filter((c) => !ownedCardSlugs.has(c.slug)).length;

  const handleRevealAllNow = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealedCount(cards.length);
  };

  const handleOpenAnother = () => {
    const generated = onOpenPackCards(tier);
    setCards(generated);
    setRevealedCount(0);
    startRevealSequence(generated.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pack-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div className="relative flex w-full max-w-5xl flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7 shadow-xl">
        {/* Cabecera limpia y deportiva */}
        <div className="flex w-full items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#e2001a]" />
            <h2 id="pack-modal-title" className="font-sans text-sm sm:text-base font-bold text-neutral-900 uppercase tracking-wide">
              {config.name}
            </h2>
            <span className="font-sans text-xs font-semibold tabular-nums text-neutral-400">
              ({cards.length} cromos)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Fila horizontal centrada de cromos */}
        <div className="my-6 flex w-full items-center justify-center overflow-x-auto py-2 px-1 scrollbar-none">
          <div className="flex items-center justify-center gap-3 sm:gap-4 min-w-max">
            {cards.map((card, idx) => (
              <PackRowCard
                key={`${card.id}-${idx}`}
                card={card}
                index={idx}
                isNew={!ownedCardSlugs.has(card.slug)}
                isRevealed={idx < revealedCount}
                onReveal={() => {
                  if (idx >= revealedCount) {
                    setRevealedCount(idx + 1);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Barra inferior de estado y acciones */}
        <PackModalActionsBar
          allRevealed={allRevealed}
          revealedCount={revealedCount}
          totalCards={cards.length}
          newCardsCount={newCardsCount}
          canOpenAnother={canOpenAnother}
          onRevealAll={handleRevealAllNow}
          onOpenAnother={handleOpenAnother}
          onPaste={() => {
            onPasteInAlbum(cards);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
