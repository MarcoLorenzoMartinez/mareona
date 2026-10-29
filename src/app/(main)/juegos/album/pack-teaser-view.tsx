"use client"; // Client: Teaser dramático de carta estrella o leyenda antes de la revelación

import type { Card } from "@/lib/cards/types";

interface PackTeaserViewProps {
  readonly starCard: Card;
  readonly onDiscover: () => void;
}

/**
 * Dramatic teaser screen for high-rated legend or walkout cards.
 */
export function PackTeaserView({ starCard, onDiscover }: PackTeaserViewProps) {
  return (
    <div className="my-8 flex flex-col items-center text-center select-none animate-in zoom-in-90 duration-300">
      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700">
        ¡Cromo Estrella Detectado!
      </span>
      <div className="my-6 flex h-36 w-36 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50 text-5xl shadow-xl shadow-amber-500/20">
        👑
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
        {starCard.position ? starCard.position.toUpperCase() : "MOMENTO HISTÓRICO"} · {starCard.eraLabel}
      </p>
      <button
        type="button"
        onClick={onDiscover}
        className="mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 cursor-pointer"
      >
        Descubrir Cartas
      </button>
    </div>
  );
}
