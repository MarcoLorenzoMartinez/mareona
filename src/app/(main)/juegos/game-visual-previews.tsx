import type { GameItem } from "./types";
import { MiniPack } from "@/components/cards/mini-pack";

/**
 * Visual preview for Memoria Rojiblanca: 3 authentic miniature booster packs
 * arranged in a static, smooth fanned-out arc without hover movement.
 */
function AlbumPreview() {
  return (
    <div className="relative flex h-14 w-full items-center justify-center select-none">
      <div className="relative -mr-2 -rotate-10 translate-y-1.5">
        <MiniPack tier="aficionado" size="sm" />
      </div>
      <div className="relative z-10 translate-y-0 scale-105 shadow-xs">
        <MiniPack tier="rojiblanco" size="sm" />
      </div>
      <div className="relative -ml-2 rotate-10 translate-y-1.5">
        <MiniPack tier="leyenda" size="sm" />
      </div>
    </div>
  );
}

/**
 * Visual preview for La Porra: general football pool prediction design
 * combining a clean vector ball emblem with the 1-X-2 segmented selector.
 */
/**
 * Visual preview for La Porra: vibrant rojiblanco match prediction selector (1-X-2)
 * featuring Sporting red branding and polished gaming pill aesthetics.
 */
function PorraPreview() {
  return (
    <div className="flex items-center justify-center select-none">
      <div className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50/50 p-1.5 shadow-2xs">
        <span className="flex h-7 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-black text-white shadow-xs">
          1
        </span>
        <span className="flex h-7 w-8 items-center justify-center rounded-full border border-neutral-200/80 bg-white text-xs font-black text-neutral-700 shadow-2xs">
          X
        </span>
        <span className="flex h-7 w-8 items-center justify-center rounded-full border border-neutral-200/80 bg-white text-xs font-black text-neutral-700 shadow-2xs">
          2
        </span>
      </div>
    </div>
  );
}

/**
 * Visual preview for Wordle: 2-row colored square grid (grey, yellow, green)
 * showing progression without displaying any specific word.
 */
function WordlePreview() {
  const row1 = ["neutral", "amber", "neutral", "neutral", "emerald"] as const;
  const colorMap = {
    neutral: "bg-neutral-200 border-neutral-300",
    amber: "bg-amber-500 border-amber-500",
    emerald: "bg-emerald-600 border-emerald-600",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 select-none">
      <div className="flex gap-1.5">
        {row1.map((col, i) => (
          <span key={`r1-${i}`} className={`h-4.5 w-4.5 rounded-xs border shadow-2xs ${colorMap[col]}`} />
        ))}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={`r2-${i}`} className={`h-4.5 w-4.5 rounded-xs border shadow-2xs ${colorMap.emerald}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Visual preview for La Pregunta del Día: authentic trivia question card motif
 * with question emblem and simulated inquiry lines.
 */
function PreguntaPreview() {
  return (
    <div className="flex items-center justify-center select-none">
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-neutral-50/80 px-3.5 py-1.5 shadow-2xs">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-black text-white shadow-2xs">
          ?
        </span>
        <div className="flex flex-col gap-1">
          <span className="h-1.5 w-16 rounded-full bg-neutral-300" />
          <span className="h-1.5 w-10 rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

/**
 * Visual preview for ¿Quién es?: 5 authentic deduction clue tiles
 * matching the game's actual columns and exact feedback color logic.
 */
function QuienEsPreview() {
  const clues = [
    { label: "PAÍS", state: "border-emerald-500 bg-emerald-50 text-emerald-800" },
    { label: "POS", state: "border-emerald-500 bg-emerald-50 text-emerald-800" },
    { label: "PARTIDOS ▲", state: "border-neutral-300 bg-neutral-100 text-neutral-700" },
    { label: "GOLES ▼", state: "border-neutral-300 bg-neutral-100 text-neutral-700" },
    { label: "DEBUT", state: "border-emerald-500 bg-emerald-50 text-emerald-800" },
  ];

  return (
    <div className="flex items-center justify-center gap-1 select-none">
      {clues.map((c, i) => (
        <span
          key={i}
          className={`flex h-7 min-w-7 sm:min-w-8 items-center justify-center rounded-md border px-1 text-[9px] font-black uppercase tracking-tight shadow-2xs ${c.state}`}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Visual preview for ¿Más o Menos?: minimalist comparative stat layout
 * using clean statistical bars and higher/lower buttons without arbitrary numbers.
 */
function MasOMenosPreview() {
  return (
    <div className="flex items-center justify-center gap-2.5 select-none">
      <div className="flex h-8 w-11 items-end justify-center gap-1 rounded-md border border-[var(--border)] bg-neutral-50 px-2 py-1.5 shadow-2xs">
        <span className="h-2 w-1.5 rounded-xs bg-neutral-300" />
        <span className="h-3.5 w-1.5 rounded-xs bg-neutral-400" />
        <span className="h-5 w-1.5 rounded-xs bg-[var(--primary)]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="rounded-xs bg-[var(--primary)] px-2 py-0.5 text-[9px] font-black text-white shadow-2xs">
          ▲ MÁS
        </span>
        <span className="rounded-xs border border-[var(--border)] bg-neutral-100 px-2 py-0.5 text-[9px] font-black text-neutral-600">
          ▼ MENOS
        </span>
      </div>
      <div className="flex h-8 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-neutral-50 shadow-2xs">
        <span className="text-xs font-black text-[var(--primary)]">¿?</span>
      </div>
    </div>
  );
}

/**
 * Pure decorative schematic preview depicting the gameplay mechanic for each minigame.
 * Integrates directly onto the clean white card surface without heavy grey containers.
 */
export function GameVisualPreview({ gameId }: { readonly gameId: GameItem["id"] }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-14 w-full items-center justify-center select-none pt-1"
    >
      {gameId === "album" && <AlbumPreview />}
      {gameId === "porra" && <PorraPreview />}
      {gameId === "wordle" && <WordlePreview />}
      {gameId === "pregunta-del-dia" && <PreguntaPreview />}
      {gameId === "quien-es" && <QuienEsPreview />}
      {gameId === "mas-o-menos" && <MasOMenosPreview />}
    </div>
  );
}
