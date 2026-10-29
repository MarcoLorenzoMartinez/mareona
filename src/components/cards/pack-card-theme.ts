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
    foilBg: "from-[#f9e282] via-[#e5be49] to-[#a37916]",
    ribbonBg: "bg-gradient-to-b from-[#fdf0b0] to-[#cca030] border-r border-amber-900/30",
    bevelHighlight: "border-t-[#fff5c7] border-l-[#fae58f] border-r-[#855f0b] border-b-[#664906]",
    monogram: "#8f670f",
    triangleGrid: "rgba(90, 65, 10, 0.25)",
    topFold: "fill-[#fff5c7] stroke-amber-200/50",
    bottomFold: "fill-[#855f0b] stroke-amber-950/60",
    nameColor: "text-[#3d2b03]",
    shadow: "shadow-xl shadow-amber-950/30 hover:shadow-2xl hover:shadow-amber-500/30",
  },
};
