"use client"; // Client: Miniatura a escala 1:1 del sobre auténtico de cromos para listas de recompensas

import type { PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";
import { PACK_CARD_THEMES } from "./pack-card-theme";

interface MiniPackProps {
  readonly tier: PackTier;
  readonly className?: string;
}

/**
 * Renders an exact 1:1 miniaturized reproduction of the official booster pack.
 * Uses uniform CSS scaling to guarantee 100% identical visual fidelity to the full-size pack.
 */
export function MiniPack({ tier, className = "" }: MiniPackProps) {
  const config = PACK_TIERS[tier];
  const theme = PACK_CARD_THEMES[tier];

  return (
    <div
      title={config.name}
      aria-label={config.name}
      className={`relative h-[41px] w-[26px] shrink-0 overflow-hidden rounded-xs shadow-2xs select-none ${className}`}
    >
      {/* Exact PackCard layout scaled down uniformly to miniature size */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[310px] w-[200px] origin-top-left"
        style={{ transform: "scale(0.13)" }}
      >
        <div
          className={`relative flex h-full w-full flex-col overflow-hidden rounded-xs border-2 bg-gradient-to-br ${theme.foilBg} ${theme.bevelHighlight}`}
        >
          {/* Top Faceted Crimp Seam */}
          <div className="relative h-4 w-full shrink-0 overflow-hidden">
            <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="h-full w-full">
              <polygon points="0,0 50,7 100,0 100,16 50,11 0,16" className={theme.topFold} />
              <line x1="50" y1="7" x2="50" y2="11" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Central Body */}
          <div className="relative flex flex-1 w-full overflow-hidden">
            <div className={`w-8 shrink-0 select-none ${theme.ribbonBg}`} />

            <div className="relative flex flex-1 flex-col justify-between p-3 overflow-hidden">
              {/* Monogram */}
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
                  >
                    RSG
                  </text>
                </svg>
              </div>

              {/* Opción A: Triángulos agrupados en la esquina superior derecha, sin invadir RSG */}
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
            </div>
          </div>

          {/* Bottom Faceted Crimp Seam */}
          <div className="relative h-4 w-full shrink-0 overflow-hidden">
            <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="h-full w-full">
              <polygon points="0,0 50,5 100,0 100,16 50,9 0,16" className={theme.bottomFold} />
              <line x1="50" y1="5" x2="50" y2="9" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
