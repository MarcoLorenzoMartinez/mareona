"use client"; // Client: Sobre de cromos auténtico estilo EA FC Ultimate Team con foil metálico y pliegues 3D

import type { PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";

interface PackCardProps {
  readonly tier: PackTier;
  readonly onOpen: (tier: PackTier) => void;
  readonly isOpening?: boolean;
}

/**
 * Authentic EA FC Ultimate Team style booster pack for Mareona.
 * Replicates the exact beveled foil packaging, top/bottom crimp folds, left brand ribbon,
 * and tone-on-tone embossed monogram without superfluous UI clutter.
 */
export function PackCard({ tier, onOpen, isOpening = false }: PackCardProps) {
  const config = PACK_TIERS[tier];

  // Metallic palette matching the user's FUT reference
  const theme = {
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
  }[tier];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isOpening && onOpen(tier)}
      onKeyDown={(e) => {
        if (!isOpening && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(tier);
        }
      }}
      aria-label={`Abrir ${config.name}`}
      className={`group relative flex aspect-[1/1.55] w-full max-w-[195px] sm:max-w-[215px] flex-col rounded-sm p-1.5 transition-all duration-300 select-none cursor-pointer hover:-translate-y-2 hover:scale-[1.02] active:scale-95 ${theme.shadow}`}
    >
      {/* 3D Beveled Foil Packet Wrapper */}
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-xs border-2 bg-gradient-to-br ${theme.foilBg} ${theme.bevelHighlight}`}
      >
        {/* Top Faceted Crimp Seam (FUT angled fold) */}
        <div className="relative h-4 w-full shrink-0 overflow-hidden">
          <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="h-full w-full">
            <polygon points="0,0 50,7 100,0 100,16 50,11 0,16" className={theme.topFold} />
            <line x1="50" y1="7" x2="50" y2="11" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Central Foil Body with FUT layout */}
        <div className="relative flex flex-1 w-full overflow-hidden">
          {/* Left Branded Vertical Ribbon (clean metallic fold) */}
          <div
            className={`w-7 sm:w-8 shrink-0 select-none ${theme.ribbonBg}`}
          />

          {/* Right Main Foil Face */}
          <div className="relative flex flex-1 flex-col justify-between p-3 overflow-hidden">
            {/* Tone-on-tone Embossed Monogram watermark */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
            >
              <svg viewBox="0 0 140 120" className="h-full w-full opacity-40">
                <text
                  x="50%"
                  y="65%"
                  textAnchor="middle"
                  fontSize="72"
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                  fill={theme.monogram}
                  letterSpacing="-4"
                  style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.4)" }}
                >
                  RSG
                </text>
              </svg>
            </div>

            {/* Geometric triangle grid pattern on the right side */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-1 top-2 bottom-2 w-16 opacity-60 flex flex-wrap content-center gap-1.5"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  style={{ borderBottomColor: theme.triangleGrid }}
                  className="h-0 w-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent"
                />
              ))}
            </div>

            {/* Specular Light Reflection Sweep on Hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            {/* Subtle Name at the bottom of the foil */}
            <div className="z-10 mt-auto pt-4 flex flex-col">
              <span
                className={`font-sans text-xs sm:text-sm font-black uppercase tracking-wider drop-shadow-xs ${theme.nameColor}`}
              >
                {config.name}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Faceted Crimp Seam (FUT angled fold) */}
        <div className="relative h-4 w-full shrink-0 overflow-hidden">
          <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="h-full w-full">
            <polygon points="0,0 50,5 100,0 100,16 50,9 0,16" className={theme.bottomFold} />
            <line x1="50" y1="5" x2="50" y2="9" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
