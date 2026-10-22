"use client"; // Client: Animación interactiva de apertura de sobre y estados locales

import { useState } from "react";
import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";

interface PackOpeningModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenPack: () => Card[];
}

export function PackOpeningModal({ isOpen, onClose, onOpenPack }: PackOpeningModalProps) {
  const [openedCards, setOpenedCards] = useState<Card[] | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  if (!isOpen) return null;

  const handleOpen = () => {
    setIsRevealing(true);
    const newCards = onOpenPack();
    setTimeout(() => {
      setOpenedCards(newCards);
      setIsRevealing(false);
    }, 400);
  };

  const handleClose = () => {
    setOpenedCards(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pack-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="flex w-full max-w-4xl flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
        <h2 id="pack-modal-title" className="text-xl font-bold text-[var(--foreground)]">
          {openedCards ? "¡Cromos Obtenidos!" : "Sobre de Cromos Históricos"}
        </h2>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          {openedCards ? "5 cartas agregadas a tu colección del Real Sporting" : "Contiene 5 cartas de todas las épocas del club"}
        </p>

        {!openedCards ? (
          <div className="my-8 flex flex-col items-center">
            {/* Gráfico representativo del sobre rojo del Sporting */}
            <div className="flex h-56 w-40 flex-col items-center justify-between rounded-xl border-2 border-[#e2001a] bg-gradient-to-b from-[#e2001a] to-[#b30015] p-4 text-white shadow-lg transition-transform hover:scale-105">
              <span className="text-[10px] font-bold tracking-widest uppercase">Real Sporting</span>
              <div className="rounded-full bg-white/20 p-3">
                <span className="text-2xl font-black">5</span>
              </div>
              <span className="text-xs font-semibold">Cromos Oficiales</span>
            </div>

            <button
              type="button"
              disabled={isRevealing}
              onClick={handleOpen}
              className="mt-6 rounded-full bg-[#e2001a] px-6 py-2.5 font-bold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {isRevealing ? "Abriendo sobre..." : "Abrir Sobre Ahora"}
            </button>
          </div>
        ) : (
          <div className="my-6 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {openedCards.map((card) => (
                <div key={card.id} className="animate-in fade-in zoom-in-95 duration-200">
                  <HistoricalCard card={card} size="sm" isOwned />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-full bg-[var(--foreground)] px-6 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              Guardar en mi Álbum
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
