"use client"; // Client: Resumen panorámico de cartas obtenidas y acción de pegado

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";

interface PackSummaryGridProps {
  readonly cards: readonly Card[];
  readonly newCardSlugs: ReadonlySet<string>;
  readonly onPasteInAlbum: () => void;
  readonly onOpenAnother?: () => void;
  readonly canOpenAnother?: boolean;
}

/**
 * Summary view shown after all cards in a pack have been progressively revealed.
 */
export function PackSummaryGrid({
  cards,
  newCardSlugs,
  onPasteInAlbum,
  onOpenAnother,
  canOpenAnother = false,
}: PackSummaryGridProps) {
  const newCount = cards.filter((c) => newCardSlugs.has(c.slug)).length;

  return (
    <div className="flex w-full flex-col items-center gap-6 py-2 select-none animate-in fade-in duration-300">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-bold text-[var(--foreground)]">
          ¡Sobre Completado!
        </h3>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Has conseguido {cards.length} cartas ({newCount} {newCount === 1 ? "nueva" : "nuevas"}).
        </p>
      </div>

      {/* Grid de cartas obtenidas */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-h-[50vh] overflow-y-auto px-2 py-1">
        {cards.map((card) => {
          const isNew = newCardSlugs.has(card.slug);
          return (
            <div key={card.id} className="relative flex flex-col items-center">
              <HistoricalCard card={card} size="sm" isOwned />
              <span
                className={`mt-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  isNew
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {isNew ? "Nuevo" : "Repetido"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Acciones principales */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onPasteInAlbum}
          className="rounded-full bg-[#e2001a] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#b30015] active:scale-95 transition-all cursor-pointer"
        >
          Pegar en mi Álbum
        </button>

        {canOpenAnother && onOpenAnother && (
          <button
            type="button"
            onClick={onOpenAnother}
            className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-xs font-bold text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] active:scale-95 transition-all cursor-pointer"
          >
            Abrir otro sobre
          </button>
        )}
      </div>
    </div>
  );
}
