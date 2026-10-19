// Client: Mapa interactivo vectorial SVG de España dividido en Comunidades Autónomas
"use client";

import { useState } from "react";
import type { RegionRivalSummary } from "@/lib/historical/rivals-types";
import spainPaths from "@/data/historical/spain-svg-paths.json";

interface SpainMapProps {
  readonly communitySummaries: readonly RegionRivalSummary[];
  readonly onSelectCommunity: (communityName: string) => void;
  readonly selectedCommunityName: string | null;
}

/**
 * Interactive SVG Map of Spain with fine red borders and hover/active states.
 * - Map fill: White / light surface
 * - Borders: Fine Sporting red lines (stroke-[#e2001a] stroke-width="1.2")
 * - Active state: Sporting red fill (fill-[#e2001a]) with white stroke
 * - Inactive regions (no matches): Disabled with light gray fill and blocked cursor
 * Conforms to AGENTS.md rule 5: strictly <= 180 lines.
 */
export function SpainMap({
  communitySummaries,
  onSelectCommunity,
  selectedCommunityName,
}: SpainMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionRivalSummary | null>(null);

  const summaryMap = new Map<string, RegionRivalSummary>();
  for (const s of communitySummaries) {
    summaryMap.set(s.regionName.toLowerCase(), s);
  }

  return (
    <div className="relative mx-auto w-full max-w-[820px] aspect-[800/550] overflow-hidden rounded-xl border border-[var(--border)] bg-white p-2 sm:p-6 shadow-2xs">
      <svg
        viewBox="0 0 800 550"
        className="h-full w-full select-none"
        role="img"
        aria-label="Mapa interactivo de España dividido por comunidades autónomas"
      >
        {/* Canarias Inset Box Outline */}
        <rect
          x="15"
          y="435"
          width="190"
          height="105"
          fill="none"
          stroke="#e2001a"
          strokeWidth="0.8"
          strokeDasharray="4 4"
          rx="6"
        />
        <text
          x="25"
          y="450"
          fontSize="10"
          fontWeight="bold"
          fill="#e2001a"
          className="font-sans"
        >
          Canarias
        </text>

        {/* Autonomous Communities Paths */}
        {spainPaths.map((region) => {
          const summary = summaryMap.get(region.name.toLowerCase());
          const hasMatches = Boolean(summary && summary.totalMatches > 0);
          const isSelected = selectedCommunityName === region.name;

          let fillClass = "fill-neutral-100/80 stroke-neutral-300 stroke-[0.8] cursor-not-allowed";
          if (isSelected) {
            fillClass = "fill-[#e2001a] stroke-white stroke-[1.5] cursor-pointer drop-shadow-sm";
          } else if (hasMatches) {
            fillClass = "fill-white hover:fill-red-50/70 stroke-[#e2001a] stroke-[1.2] cursor-pointer transition-colors";
          }

          return (
            <path
              key={region.id}
              d={region.path}
              className={fillClass}
              onClick={() => {
                if (hasMatches && summary) {
                  onSelectCommunity(region.name);
                }
              }}
              onMouseEnter={() => {
                if (summary) setHoveredRegion(summary);
              }}
              onMouseLeave={() => setHoveredRegion(null)}
              aria-label={`${region.name}: ${summary ? summary.totalMatches : 0} partidos`}
            >
              <title>
                {region.name}
                {summary ? ` (${summary.totalMatches} PJ - ${summary.won}V ${summary.drawn}E ${summary.lost}D)` : " (Sin rivales oficiales)"}
              </title>
            </path>
          );
        })}
      </svg>

      {/* Hover Floating Card Tooltip */}
      {hoveredRegion && (
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-[var(--primary)] bg-white/95 p-3 shadow-md backdrop-blur-xs">
          <p className="text-xs font-bold text-neutral-900">{hoveredRegion.regionName}</p>
          <p className="mt-0.5 text-[11px] font-sans font-semibold text-neutral-600 tabular-nums">
            {hoveredRegion.totalMatches} PJ · {hoveredRegion.won}V - {hoveredRegion.drawn}E - {hoveredRegion.lost}D
          </p>
          <p className="text-[10px] text-[var(--primary)] font-bold">
            {hoveredRegion.totalRivals} {hoveredRegion.totalRivals === 1 ? "rival" : "rivales"}
          </p>
        </div>
      )}
    </div>
  );
}
