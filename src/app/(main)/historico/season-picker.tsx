// Client: Selector accesible de temporada con campo redondeado rojo/blanco y flechas sutiles
"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HistoricalSeason } from "@/lib/historical/types";

interface SeasonSelectorProps {
  readonly seasons: readonly HistoricalSeason[];
  readonly selectedSeasonId: string;
  readonly onSelectSeason: (seasonId: string) => void;
  // Optional legacy props kept for signature compatibility
  readonly decades?: readonly { label: string; decadeStart: number }[];
  readonly activeDecade?: number;
  readonly onSelectDecade?: (decadeStart: number) => void;
}

/**
 * Modern, subtle season navigator placed directly underneath the historical evolution chart.
 * Features a white rounded pill with a red border and red numbers, flanked closely
 * by red chevron arrows for intuitive step-by-step navigation.
 */
export function HistoricalSeasonSelector({
  seasons,
  selectedSeasonId,
  onSelectSeason,
}: SeasonSelectorProps) {
  // Sort chronologically ascending (1928 to present) for left-to-right timeline alignment
  const chronological = useMemo(() => {
    return [...seasons].sort((a, b) => a.startYear - b.startYear);
  }, [seasons]);

  const currentIndex = chronological.findIndex((s) => s.id === selectedSeasonId);
  const currentSeason = chronological[currentIndex] ?? chronological[0]!;

  // Left arrow goes backward in time (e.g. 1978-79 -> 1977-78)
  const prevSeason = currentIndex > 0 ? chronological[currentIndex - 1] : null;

  // Right arrow goes forward in time (e.g. 1978-79 -> 1979-80)
  const nextSeason =
    currentIndex >= 0 && currentIndex < chronological.length - 1
      ? chronological[currentIndex + 1]
      : null;

  const handlePrev = () => {
    if (prevSeason) {
      onSelectSeason(prevSeason.id);
    }
  };

  const handleNext = () => {
    if (nextSeason) {
      onSelectSeason(nextSeason.id);
    }
  };

  return (
    <nav
      aria-label="Navegación de temporadas históricas"
      className="flex items-center justify-center gap-1.5 sm:gap-2 my-1"
    >
      {/* Flecha Izquierda: moderna, sutil y roja, pegada al campo */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!prevSeason}
        aria-label={
          prevSeason
            ? `Temporada anterior: ${prevSeason.label}`
            : "No hay temporada anterior"
        }
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--primary)] transition-all hover:bg-red-50/80 active:scale-95 disabled:pointer-events-none disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <ChevronLeft className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
      </button>

      {/* Campo central: redondeado, fondo blanco, borde y números rojos */}
      <div className="relative inline-flex items-center justify-center">
        <label htmlFor="historical-season-select" className="sr-only">
          Seleccionar temporada histórica
        </label>

        {/* Presentación visual con números de temporada estrictamente */}
        <div className="inline-flex min-h-[44px] min-w-[130px] sm:min-w-[150px] items-center justify-center rounded-full border-2 border-[var(--primary)] bg-white px-5 py-2 text-base sm:text-lg font-bold tracking-tight text-[var(--primary)] font-sans tabular-nums shadow-xs select-none">
          {currentSeason.label}
        </div>

        {/* Desplegable nativo accesible superpuesto para salto rápido directo */}
        <select
          id="historical-season-select"
          value={currentSeason.id}
          onChange={(e) => onSelectSeason(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 rounded-full"
          title={`Temporada ${currentSeason.label}`}
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({s.tier === 1 ? "1.ª División" : "2.ª División"})
            </option>
          ))}
        </select>
      </div>

      {/* Flecha Derecha: moderna, sutil y roja, pegada al campo */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!nextSeason}
        aria-label={
          nextSeason
            ? `Temporada siguiente: ${nextSeason.label}`
            : "No hay temporada siguiente"
        }
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--primary)] transition-all hover:bg-red-50/80 active:scale-95 disabled:pointer-events-none disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <ChevronRight className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
      </button>
    </nav>
  );
}

// Alias for backwards compatibility
export const HistoricalSeasonPicker = HistoricalSeasonSelector;
