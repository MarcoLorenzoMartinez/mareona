import Image from "next/image";
import type { HistoricalCrestEra } from "@/lib/cards/types";
import { areOfficialAssetsEnabled } from "@/lib/legal/official-assets";

interface HistoricalCrestBadgeProps {
  readonly era: HistoricalCrestEra;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

const ERA_LABELS: Record<HistoricalCrestEra, string> = {
  "1905": "1912 — Real Sporting Gijonés (Orígenes)",
  republic: "1931 — II República (Corona Mural)",
  classic_1950: "1950 — Real Gijón (Corona Real)",
  golden_1980: "1978 — Era Dorada (Quini, Maceda, Ferrero)",
  modern: "Real Sporting (Oficial)",
};

const CREST_IMAGE_BY_ERA: Record<HistoricalCrestEra, string> = {
  "1905": "/crests/historical/sporting-1905.png",
  republic: "/crests/historical/sporting-republic.png",
  classic_1950: "/crests/historical/sporting-classic-1950.png",
  golden_1980: "/crests/historical/sporting-golden-1980.png",
  modern: "/crests/historical/sporting-modern.png",
};

/**
 * Historical Sporting crest badge rendering authentic historical crest images
 * for each era of the club's 120-year history.
 */
export function HistoricalCrestBadge({
  era,
  size = "md",
  className = "",
}: HistoricalCrestBadgeProps) {
  const isSm = size === "sm";
  const label = ERA_LABELS[era];
  const crestPath = CREST_IMAGE_BY_ERA[era] ?? "/crests/historical/sporting-modern.png";
  const sizePx = isSm ? 32 : 40;
  const dimensionClass = isSm ? "h-8 w-8" : "h-10 w-10";

  if (!areOfficialAssetsEnabled()) {
    return (
      <div
        aria-label={`Escudo histórico: ${label}`}
        title={label}
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full border border-amber-300 bg-[#e2001a] text-[9px] font-black tracking-tight text-white ${dimensionClass} ${className}`}
      >
        RSG
      </div>
    );
  }

  return (
    <div
      aria-label={`Escudo histórico oficial: ${label}`}
      title={label}
      className={`relative inline-flex shrink-0 items-center justify-center ${dimensionClass} ${className}`}
    >
      <Image
        src={crestPath}
        alt={`Escudo Real Sporting: ${label}`}
        width={sizePx}
        height={sizePx}
        unoptimized
        className="h-full w-full object-contain drop-shadow-2xs"
      />
    </div>
  );
}
