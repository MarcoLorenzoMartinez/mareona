// Client: Mapa interactivo vectorial SVG del mundo por países
"use client";

import { useState } from "react";
import type { RegionRivalSummary } from "@/lib/historical/rivals-types";
import worldPaths from "@/data/historical/world-svg-paths.json";

interface WorldMapProps {
  readonly countrySummaries: readonly RegionRivalSummary[];
  readonly onSelectCountry: (countryName: string) => void;
  readonly selectedCountryName: string | null;
}

/**
 * Interactive SVG Map of the World highlighting countries with competitive matches.
 * - Map fill: White / neutral surface
 * - Active / available countries: Fine red borders (stroke-[#e2001a] stroke-width="1")
 * - Non-rival countries: Subdued gray fill with disabled cursor
 */
export function WorldMap({
  countrySummaries,
  onSelectCountry,
  selectedCountryName,
}: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<RegionRivalSummary | null>(null);

  const countryMap = new Map<string, RegionRivalSummary>();
  for (const s of countrySummaries) {
    countryMap.set(s.regionName.toLowerCase(), s);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Mapa del Mundo por Países
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Haz clic en cualquier país rival para consultar el historial completo en competiciones oficiales.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-semibold text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-[#e2001a] bg-red-50/60" /> Con partidos oficiales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#e2001a]" /> Seleccionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-neutral-300 bg-neutral-100 opacity-60" /> Sin enfrentamientos
          </span>
        </div>
      </div>

      {/* SVG Canvas Container Zoomed on European/Mediterranean Rival Area */}
      <div className="relative mx-auto w-full max-w-[820px] aspect-[135/100] overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/40 p-2 sm:p-4">
        <svg
          viewBox="398 75 130 96"
          className="h-full w-full select-none"
          role="img"
          aria-label="Mapa de países rivales del Real Sporting en competiciones oficiales"
        >
          {worldPaths.map((country) => {
            const summary = countryMap.get(country.name.toLowerCase());
            const hasMatches = Boolean(summary && summary.totalMatches > 0);
            const isSelected = selectedCountryName === country.name;

            let fillClass = "fill-neutral-100/70 stroke-neutral-200 stroke-[0.15] cursor-not-allowed";
            if (isSelected) {
              fillClass = "fill-[#e2001a] stroke-white stroke-[0.4] cursor-pointer drop-shadow-sm";
            } else if (hasMatches) {
              fillClass = "fill-white hover:fill-red-50/80 stroke-[#e2001a] stroke-[0.35] cursor-pointer transition-colors";
            }

            return (
              <path
                key={country.id}
                d={country.path}
                className={fillClass}
                onClick={() => {
                  if (hasMatches && summary) {
                    onSelectCountry(country.name);
                  }
                }}
                onMouseEnter={() => {
                  if (summary) setHoveredCountry(summary);
                }}
                onMouseLeave={() => setHoveredCountry(null)}
                aria-label={`${country.name}: ${summary ? summary.totalMatches : 0} partidos`}
              >
                <title>
                  {country.name}
                  {summary ? ` (${summary.totalMatches} PJ - ${summary.won}V ${summary.drawn}E ${summary.lost}D)` : " (Sin partidos oficiales)"}
                </title>
              </path>
            );
          })}
        </svg>

        {/* Hover Floating Card Tooltip */}
        {hoveredCountry && (
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-[var(--primary)] bg-white/95 p-3 shadow-md backdrop-blur-xs">
            <p className="text-xs font-bold text-neutral-900">{hoveredCountry.regionName}</p>
            <p className="mt-0.5 text-[11px] font-sans font-semibold text-neutral-600 tabular-nums">
              {hoveredCountry.totalMatches} PJ · {hoveredCountry.won}V - {hoveredCountry.drawn}E - {hoveredCountry.lost}D
            </p>
            <p className="text-[10px] text-[var(--primary)] font-bold">
              {hoveredCountry.totalRivals} {hoveredCountry.totalRivals === 1 ? "club" : "clubes"}
            </p>
          </div>
        )}
      </div>

      {/* Quick Select Country Pills Below Map */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-neutral-500 mr-1 uppercase tracking-wider">
          Países con rivales oficiales:
        </span>
        {countrySummaries.map((c) => {
          const isSelected = selectedCountryName === c.regionName;
          return (
            <button
              key={c.regionId}
              type="button"
              onClick={() => onSelectCountry(c.regionName)}
              className={`rounded-full px-2.5 py-1 text-xs font-sans transition-all active:scale-95 ${
                isSelected
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "border border-[var(--border)] bg-white text-neutral-700 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {c.regionName} ({c.totalMatches} PJ)
            </button>
          );
        })}
      </div>
    </div>
  );
}
