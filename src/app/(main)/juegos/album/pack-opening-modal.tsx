"use client"; // Client: Modal de apertura con ritmo dinámico de hype y halo por OVR

import { useState, useEffect, useRef, useCallback } from "react";
import type { Card, PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";
import { MiniPack } from "@/components/cards/mini-pack";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { PackRowCard } from "./pack-row-card";
import { PackModalActionsBar } from "./pack-modal-actions-bar";

interface PackOpeningModalProps {
  readonly isOpen: boolean;
  readonly tier: PackTier;
  readonly canOpenAnother?: boolean;
  readonly onClose: () => void;
  readonly onOpenPackCards: (tier: PackTier) => Card[];
  readonly onSaveCards: () => void;
  readonly ownedCardSlugs: ReadonlySet<string>;
}

export function PackOpeningModal({
  isOpen,
  tier,
  canOpenAnother = false,
  onClose,
  onOpenPackCards,
  onSaveCards,
  ownedCardSlugs,
}: PackOpeningModalProps) {
  const [cards, setCards] = useState<Card[]>(() => (isOpen ? onOpenPackCards(tier) : []));
  const [revealedCount, setRevealedCount] = useState(0);
  const [anticipatingIndex, setAnticipatingIndex] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRevealSequence = useCallback((cardsToReveal: readonly Card[]) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    let step = 0;

    const tick = () => {
      if (step >= cardsToReveal.length) return;
      const nextCard = cardsToReveal[step];
      const ovr = nextCard?.ovr ?? 70;
      const isHighOvr = ovr >= 80;

      if (isHighOvr) {
        setAnticipatingIndex(step);
        const pauseMs = ovr >= 86 ? 1400 : 1100;
        timerRef.current = setTimeout(() => {
          step += 1;
          setRevealedCount(step);
          setAnticipatingIndex(null);
          if (step < cardsToReveal.length) {
            timerRef.current = setTimeout(tick, 750);
          }
        }, pauseMs);
      } else {
        step += 1;
        setRevealedCount(step);
        setAnticipatingIndex(null);
        if (step < cardsToReveal.length) {
          timerRef.current = setTimeout(tick, 800);
        }
      }
    };

    timerRef.current = setTimeout(tick, 500);
  }, []);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (cards.length > 0) {
      startRevealSequence(cards);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, cards, startRevealSequence]);

  const allRevealed = cards.length > 0 && revealedCount >= cards.length;

  const handleRevealAllNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealedCount(cards.length);
    setAnticipatingIndex(null);
  }, [cards.length]);

  const handleDismiss = useCallback(() => {
    onSaveCards();
    handleClose();
  }, [onSaveCards, handleClose]);

  const { handleBackdropClick } = useModalA11y({
    isOpen,
    onClose: handleDismiss,
  });

  if (!isOpen) return null;

  const config = PACK_TIERS[tier];

  const handleOpenAnother = () => {
    const generated = onOpenPackCards(tier);
    setCards(generated);
    setRevealedCount(0);
    startRevealSequence(generated);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pack-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-6 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="relative flex w-full max-w-5xl max-h-[92vh] overflow-y-auto flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-3.5 sm:p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera limpia y deportiva */}
        <div className="flex w-full items-center justify-between border-b border-[var(--border)] pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <MiniPack tier={tier} />
            <h2 id="pack-modal-title" className="font-sans text-xs sm:text-base font-bold text-neutral-900 uppercase tracking-wide truncate">
              {config.name}
            </h2>
            {!allRevealed && (
              <button
                type="button"
                onClick={handleRevealAllNow}
                className="shrink-0 rounded-full border border-[var(--border)] bg-neutral-50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-neutral-600 hover:border-[#e2001a] hover:text-[#e2001a] hover:bg-red-50/50 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                title="Mostrar todos los cromos al instante sin esperar la animación"
              >
                Saltar animación
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar y guardar sobre"
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            ✕
          </button>
        </div>

        {/* Fila de cromos adaptativa y centrada */}
        <div className="my-auto flex w-full flex-1 items-center justify-center py-4 sm:py-8">
          <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto p-1 max-w-full">
            {cards.map((card, idx) => (
              <PackRowCard
                key={`${card.slug}-${idx}`}
                card={card}
                isNew={!ownedCardSlugs.has(card.slug)}
                isRevealed={idx < revealedCount}
                isAnticipating={idx === anticipatingIndex}
                index={idx}
                onReveal={() => idx >= revealedCount && setRevealedCount(idx + 1)}
                totalCards={cards.length}
              />
            ))}
          </div>
        </div>

        {/* Barra inferior */}
        <PackModalActionsBar
          allRevealed={allRevealed}
          canOpenAnother={canOpenAnother}
          onOpenAnother={handleOpenAnother}
          onSaveCards={handleDismiss}
        />
      </div>
    </div>
  );
}
