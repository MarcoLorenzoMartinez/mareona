"use client"; // Client: Modal de apertura con ritmo dinámico de hype y halo por OVR

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
        const pauseMs = ovr >= 85 ? 1400 : 1100;
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

  useEffect(() => {
    if (!isOpen) {
      setCards([]);
      setRevealedCount(0);
      setAnticipatingIndex(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const generated = onOpenPackCards(tier);
    setCards(generated);
    setRevealedCount(0);
    startRevealSequence(generated);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
        <div className="my-6 flex w-full items-center justify-center overflow-x-auto py-3 px-2 scrollbar-none">
          <div className="flex items-center justify-center gap-3 sm:gap-4 min-w-max">
            {cards.map((card, idx) => (
              <PackRowCard
                key={`${card.id}-${idx}`}
                card={card}
                index={idx}
                isNew={!ownedCardSlugs.has(card.slug)}
                isRevealed={idx < revealedCount}
                isAnticipating={idx === anticipatingIndex}
                onReveal={() => {
                  if (idx >= revealedCount) {
                    setRevealedCount(idx + 1);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Barra inferior sin textos explicativos */}
        <PackModalActionsBar
          allRevealed={allRevealed}
          revealedCount={revealedCount}
          totalCards={cards.length}
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
