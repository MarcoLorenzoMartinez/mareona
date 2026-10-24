import type { Card } from "@/lib/cards/types";
import {
  CardScaleFrame,
  CARD_CANONICAL_WIDTH,
  CARD_CANONICAL_HEIGHT,
} from "@/components/cards/card-scale-frame";

interface AlbumCardSlotProps {
  readonly card: Card;
  readonly cardNumber: number;
}

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "POR",
  defender: "DEF",
  midfielder: "MED",
  forward: "DEL",
};

const KIND_LABEL: Record<string, string> = {
  crest: "ESCUDO",
  moment: "MOMENTO",
  coach: "MÍSTER",
};

/**
 * Empty troqueled slot in the album spread for a card not yet owned.
 * Simulates the printed cardboard sticker space from real Panini/Este albums.
 */
export function AlbumCardSlot({ card, cardNumber }: AlbumCardSlotProps) {
  const typeLabel =
    card.position
      ? POSITION_LABEL[card.position] ?? "JUG"
      : KIND_LABEL[card.kind ?? "player"] ?? "JUG";

  return (
    <CardScaleFrame size="fill">
      <div
        className="relative flex flex-col items-center justify-between rounded-none p-1.5 select-none"
        style={{
          width: CARD_CANONICAL_WIDTH,
          height: CARD_CANONICAL_HEIGHT,
          background:
            "linear-gradient(135deg, rgba(200,185,155,0.22) 0%, rgba(220,205,175,0.10) 100%)",
          border: "1.5px dashed rgba(160,130,80,0.35)",
          boxShadow:
            "inset 0 1px 3px rgba(100,70,20,0.08), inset 0 -1px 2px rgba(100,70,20,0.04)",
        }}
        aria-label={`Casilla vacía: ${card.knownAs}`}
      >
        {/* Corner adhesive tabs (classic album sticker corners) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 border-l border-t border-amber-600/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0.5 top-0.5 h-3 w-3 border-r border-t border-amber-600/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0.5 left-0.5 h-3 w-3 border-b border-l border-amber-600/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0.5 right-0.5 h-3 w-3 border-b border-r border-amber-600/30"
        />

        {/* Card number */}
        <span className="text-[8px] font-black tabular-nums text-amber-700/50 tracking-wider self-end pr-0.5">
          #{cardNumber}
        </span>

        {/* Center silhouette area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-1">
          {/* Ghosted player silhouette or crest placeholder */}
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: "rgba(160,130,80,0.10)",
              border: "1px dashed rgba(160,130,80,0.25)",
            }}
          >
            <span className="text-[9px] font-black text-amber-700/40 tracking-wider uppercase">
              {typeLabel}
            </span>
          </div>

          {/* Player name */}
          <p
            className="text-center text-[8px] font-bold uppercase tracking-wide text-amber-800/50 leading-tight line-clamp-2"
            style={{ maxWidth: "90%" }}
          >
            {card.knownAs}
          </p>
        </div>

        {/* "Pega aquí tu cromo" label */}
        <p
          aria-hidden="true"
          className="text-center text-[6.5px] font-semibold uppercase tracking-widest text-amber-700/35"
        >
          Pega aquí
        </p>
      </div>
    </CardScaleFrame>
  );
}
