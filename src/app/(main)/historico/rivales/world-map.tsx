// Client: Mapa interactivo vectorial SVG del mundo por países
"use client";

import { useState, useMemo } from "react";
import type { RegionRivalSummary } from "@/lib/historical/rivals-types";
import worldPaths from "@/data/historical/world-svg-paths.json";

interface WorldMapProps {
  readonly countrySummaries: readonly RegionRivalSummary[];
  readonly onSelectCountry: (countryName: string) => void;
  readonly selectedCountryName: string | null;
}

/**
 * Interactive SVG Map of the World highlighting countries with competitive matches.
 * Uses layered rendering to ensure border strokes are never occluded by neighboring polygon fills.
 * Conforms to AGENTS.md rule 5: strictly <= 180 lines.
 */
export function WorldMap({
  countrySummaries,
  onSelectCountry,
  selectedCountryName,
}: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<RegionRivalSummary | null>(null);

  const countryMap = useMemo(() => {
    const map = new Map<string, RegionRivalSummary>();
    for (const s of countrySummaries) {
      map.set(s.regionName.toLowerCase(), s);
    }
    return map;
  }, [countrySummaries]);

  const { inactiveCountries, rivalCountries } = useMemo(() => {
    const inactive: typeof worldPaths = [];
    const rivals: typeof worldPaths = [];

    for (const country of worldPaths) {
      const summary = countryMap.get(country.name.toLowerCase());
      if (summary && summary.totalMatches > 0) {
        rivals.push(country);
      } else {
        inactive.push(country);
      }
    }
    return { inactiveCountries: inactive, rivalCountries: rivals };
  }, [countryMap]);

  return (
    <div className="relative mx-auto w-full max-w-[820px] aspect-[135/100] overflow-hidden rounded-xl border border-[var(--border)] bg-white p-2 sm:p-6 shadow-2xs">
      <svg
        viewBox="398 75 130 96"
        className="h-full w-full select-none"
        role="img"
        aria-label="Mapa de países rivales del Real Sporting en competiciones oficiales"
      >
        {/* Capa 1: Países sin enfrentamientos (fondo gris) */}
        {inactiveCountries.map((country) => (
          <path
            key={country.id}
            d={country.path}
            className="fill-neutral-100/70 stroke-neutral-200 stroke-[0.15] cursor-not-allowed"
          >
            <title>{country.name} (Sin partidos oficiales)</title>
          </path>
        ))}

        {/* Capa 2: Rellenos e interactividad de países rivales */}
        {rivalCountries.map((country) => {
          const summary = countryMap.get(country.name.toLowerCase());
          const isSelected = selectedCountryName === country.name;

          return (
            <path
              key={country.id}
              d={country.path}
              className={
                isSelected
                  ? "fill-[#e2001a] cursor-pointer"
                  : "fill-white hover:fill-red-50/80 cursor-pointer transition-colors"
              }
              onClick={() => {
                if (summary) onSelectCountry(country.name);
              }}
              onMouseEnter={() => {
                if (summary) setHoveredCountry(summary);
              }}
              onMouseLeave={() => setHoveredCountry(null)}
              aria-label={`${country.name}: ${summary ? summary.totalMatches : 0} partidos`}
            >
              <title>
                {country.name}
                {summary ? ` (${summary.totalMatches} PJ - ${summary.won}V ${summary.drawn}E ${summary.lost}D)` : ""}
              </title>
            </path>
          );
        })}

        {/* Capa 3: Bordes rojos destacados por encima de todos los rellenos */}
        <g className="pointer-events-none" aria-hidden="true">
          {rivalCountries.map((country) => {
            const isSelected = selectedCountryName === country.name;
            return (
              <path
                key={`stroke-${country.id}`}
                d={country.path}
                fill="none"
                stroke={isSelected ? "white" : "#e2001a"}
                strokeWidth={isSelected ? "0.4" : "0.35"}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={isSelected ? "drop-shadow-sm" : ""}
              />
            );
          })}
        </g>
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
  );
}
