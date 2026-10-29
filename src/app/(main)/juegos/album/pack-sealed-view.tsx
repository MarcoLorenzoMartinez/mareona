"use client"; // Client: Vista de sobre sellado con efecto de rasgado y botón de apertura

import type { PackTierConfig } from "@/lib/cards/types";

interface PackSealedViewProps {
  readonly config: PackTierConfig;
  readonly isTearing: boolean;
  readonly onTear: () => void;
}

/**
 * Renders the 3D sealed foil packet waiting to be torn open.
 */
export function PackSealedView({ config, isTearing, onTear }: PackSealedViewProps) {
  return (
    <div className="my-8 flex flex-col items-center text-center select-none">
      <div
        className={`relative flex h-60 w-44 flex-col items-center justify-between rounded-2xl border-2 border-white/20 bg-gradient-to-b from-[#e2001a] to-[#80000e] p-5 text-white shadow-2xl transition-all duration-300 ${
          isTearing ? "scale-95 animate-pulse" : "hover:scale-105"
        }`}
      >
        <span className="text-[10px] font-bold tracking-widest uppercase">Real Sporting</span>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-3xl font-black">
          {config.cardCount}
        </div>
        <span className="text-xs font-bold uppercase">{config.name}</span>
      </div>

      <button
        type="button"
        disabled={isTearing}
        onClick={onTear}
        className="mt-6 rounded-full bg-[#e2001a] px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#b30015] active:scale-95 transition-all cursor-pointer"
      >
        {isTearing ? "Rasgando sobre..." : "Rasgar y Abrir Sobre"}
      </button>
    </div>
  );
}
