"use client"; // Client: Sobre de cromos auténtico estilo EA FC Ultimate Team con foil metálico y pliegues 3D

import type { PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";
import { PACK_CARD_THEMES } from "./pack-card-theme";
import { getDictionary } from "@/i18n";

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
export function PackCard({
  tier,
  onOpen,
  isOpening = false,
}: PackCardProps) {
  const dict = getDictionary();
  const config = PACK_TIERS[tier];
  const theme = PACK_CARD_THEMES[tier];

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
      aria-label={`${dict.cards.packOpenAriaPrefix} ${config.name}`}
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
          <div className={`w-7 sm:w-8 shrink-0 select-none ${theme.ribbonBg}`} />

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

            {/* Triángulos agrupados en la esquina superior derecha, sin invadir el monograma RSG */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-1.5 top-2 w-10 opacity-70 flex flex-wrap justify-end gap-1"
            >
              {Array.from({ length: 9 }).map((_, i) => (
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
