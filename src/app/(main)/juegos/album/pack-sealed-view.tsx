"use client"; // Client: Vista de sobre sellado con efecto de rasgado y botón de apertura

import type { PackTierConfig } from "@/lib/cards/types";
import { PackCard } from "@/components/cards/pack-card";

interface PackSealedViewProps {
  readonly config: PackTierConfig;
  readonly isTearing: boolean;
  readonly onTear: () => void;
}

/**
 * Renders the minimalist sealed foil booster pack waiting to be torn open in the modal.
 */
export function PackSealedView({ config, isTearing, onTear }: PackSealedViewProps) {
  return (
    <div className="my-8 flex flex-col items-center text-center select-none">
      <div className={`transition-all duration-300 ${isTearing ? "scale-95 animate-pulse" : ""}`}>
        <PackCard
          tier={config.tier}
          onOpen={onTear}
          isOpening={isTearing}
        />
      </div>

      <button
        type="button"
        disabled={isTearing}
        onClick={onTear}
        className="mt-6 rounded-full bg-[#e2001a] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#b30015] active:scale-95 transition-all cursor-pointer"
      >
        {isTearing ? "Rasgando sobre..." : "Rasgar Sobre"}
      </button>
    </div>
  );
}
