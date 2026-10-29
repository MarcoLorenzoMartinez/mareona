"use client"; // Client: Teaser dramático de carta estrella o leyenda antes de la revelación

import type { Card } from "@/lib/cards/types";

interface PackTeaserViewProps {
  readonly starCard: Card;
  readonly onDiscover: () => void;
}

/**
 * Modern, clean teaser screen for high-rated legend or walkout cards.
 */
export function PackTeaserView({ starCard, onDiscover }: PackTeaserViewProps) {
  return (
    <div className="my-8 flex flex-col items-center text-center select-none animate-in zoom-in-90 duration-300">
      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700">
        Cromo Estrella Detectado
      </span>

      <div className="my-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-400 bg-amber-50 shadow-lg shadow-amber-500/15 text-amber-600">
        <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
        {starCard.position ? starCard.position.toUpperCase() : "MOMENTO HISTÓRICO"} · {starCard.eraLabel}
      </p>

      <button
        type="button"
        onClick={onDiscover}
        className="mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
      >
        Descubrir Cartas
      </button>
    </div>
  );
}
