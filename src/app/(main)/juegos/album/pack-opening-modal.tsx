"use client"; // Client: Modal de apertura con ritmo dinámico de hype y halo por OVR

import { useState, useEffect, useRef, useCallback } from "react";
import type { Card, PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";
import { MiniPack } from "@/components/cards/mini-pack";
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

  // Secuencia con pausas de suspense según la valoración de la carta
  const startRevealSequence = useCallback((cardsToReveal: readonly Card[]) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    let step = 0;

    const tick = () => {
      if (step >= cardsToReveal.length) return;
      const nextCard = cardsToReveal[step];
      const ovr = nextCard?.ovr ?? 70;
      const isHighOvr = ovr >= 80;

      // Si la carta tiene halo, activamos anticipación breve antes de voltear
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

  if (!isOpen) return null;

  const config = PACK_TIERS[tier];
  const allRevealed = cards.length > 0 && revealedCount >= cards.length;

  const handleRevealAllNow = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealedCount(cards.length);
    setAnticipatingIndex(null);
  };

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
    >
      <div className="relative flex w-full max-w-5xl max-h-[92vh] overflow-y-auto flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-3.5 sm:p-7 shadow-xl">
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
                className="shrink-0 rounded-full border border-[var(--border)] bg-neutral-50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-neutral-600 hover:border-[#e2001a] hover:text-[#e2001a] hover:bg-red-50/50 active:scale-95 transition-all cursor-pointer"
                title="Mostrar todos los cromos al instante sin esperar la animación"
              >
                Saltar animación
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Fila de cromos adaptativa y centrada */}
        <div className="my-2 sm:my-3 flex w-full items-center justify-center py-4 sm:py-7 px-1 sm:px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap max-w-full">
            {cards.map((card, idx) => (
              <PackRowCard
                key={`${card.id}-${idx}`}
                card={card}
                index={idx}
                isNew={!ownedCardSlugs.has(card.slug)}
                isRevealed={idx < revealedCount}
                isAnticipating={idx === anticipatingIndex}
                onReveal={() => idx >= revealedCount && setRevealedCount(idx + 1)}
                totalCards={cards.length}
              />
            ))}
          </div>
        </div>

        {/* Barra inferior sin textos explicativos */}
        <PackModalActionsBar
          allRevealed={allRevealed}
          canOpenAnother={canOpenAnother}
          onOpenAnother={handleOpenAnother}
          onSaveCards={() => {
            onSaveCards();
            handleClose();
          }}
        />
      </div>
    </div>
  );
}
