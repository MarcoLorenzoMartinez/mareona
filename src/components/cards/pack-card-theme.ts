import type { PackTier } from "@/lib/cards/types";

export interface PackCardTheme {
  readonly foilBg: string;
  readonly ribbonBg: string;
  readonly bevelHighlight: string;
  readonly monogram: string;
  readonly triangleGrid: string;
  readonly topFold: string;
  readonly bottomFold: string;
  readonly nameColor: string;
  readonly shadow: string;
}

export const PACK_CARD_THEMES: Record<PackTier, PackCardTheme> = {
  aficionado: {
    foilBg: "from-[#eaebee] via-[#d5d7dc] to-[#b8bac0]",
    ribbonBg: "bg-gradient-to-b from-[#f8f9fa] to-[#d8dadf] border-r border-[#9ea1a8]/40",
    bevelHighlight: "border-t-[#ffffff] border-l-[#f4f5f7] border-r-[#8a8d94] border-b-[#787b82]",
    monogram: "#9ea1a8",
    triangleGrid: "rgba(100, 105, 115, 0.28)",
    topFold: "fill-[#f4f5f7] stroke-[#8a8d94]/30",
    bottomFold: "fill-[#8a8d94] stroke-[#585c64]/40",
    nameColor: "text-[#34373d]",
    shadow: "shadow-lg shadow-neutral-400/30 hover:shadow-2xl hover:shadow-neutral-500/40",
  },
  rojiblanco: {
    foilBg: "from-[#ef1a32] via-[#d40018] to-[#8f0010]",
    ribbonBg: "bg-gradient-to-b from-[#ff3349] to-[#b80015] border-r border-red-950/30",
    bevelHighlight: "border-t-[#ff808f] border-l-[#ff4d61] border-r-[#73000d] border-b-[#59000a]",
    monogram: "#7a000e",
    triangleGrid: "rgba(255, 255, 255, 0.22)",
    topFold: "fill-[#ff4d61] stroke-red-200/40",
    bottomFold: "fill-[#73000d] stroke-red-950/60",
    nameColor: "text-white",
    shadow: "shadow-xl shadow-red-950/30 hover:shadow-2xl hover:shadow-red-900/50",
  },
  leyenda: {
    // Fondo de foil en Rojo Granate Profundo / Rubí Real (identidad pura sportinguista de gala)
    foilBg: "from-[#4a0008] via-[#2c0005] to-[#1a0003]",
    // Cinta vertical en Oro Cepillado con doble filete reflectante
    ribbonBg: "bg-gradient-to-b from-[#f9df7b] via-[#d4af37] to-[#997519] border-r-2 border-[#fff7cc]/80",
    // Bisel reflectante en oro auténtico
    bevelHighlight: "border-t-[#fff4bd] border-l-[#f0ce62] border-r-[#7d5e11] border-b-[#473406]",
    // Monograma RSG grabado en oro noble sobre el fondo granate
    monogram: "#d4af37",
    // Micro-triángulos superiores en oro pulido
    triangleGrid: "rgba(249, 223, 123, 0.45)",
    // Pliegues angulados superior e inferior en oro facetado
    topFold: "fill-[#f9df7b] stroke-[#fff4bd]/70",
    bottomFold: "fill-[#997519] stroke-[#473406]/90",
    // Tipografía nítida en oro brillante
    nameColor: "text-[#fff1b8]",
    shadow: "shadow-2xl shadow-red-950/60 ring-1 ring-[#d4af37]/60 hover:shadow-red-950/90 hover:ring-[#f9df7b] hover:scale-[1.03]",
  },
};
