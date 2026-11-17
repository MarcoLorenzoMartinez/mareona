// Client: Segmented pill controls for standings view mode and scope selection
"use client";

import type { StandingsViewScope } from "@/lib/sports-api/types";
import type { ClassificationViewMode } from "./standings-view";
import type { DisplayMode } from "./evolution-chart";

interface OptionItem<T> {
  readonly id: T;
  readonly label: string;
}

interface StandingsViewControlsProps {
  readonly mode: ClassificationViewMode;
  readonly onSelectMode: (mode: ClassificationViewMode) => void;
  readonly viewModeOptions: readonly OptionItem<ClassificationViewMode>[];
  readonly scope: StandingsViewScope;
  readonly onSelectScope: (scope: StandingsViewScope) => void;
  readonly scopeOptions: readonly OptionItem<StandingsViewScope>[];
  readonly evolutionMode: DisplayMode;
  readonly onSelectEvolutionMode: (mode: DisplayMode) => void;
  readonly evolutionModeOptions: readonly OptionItem<DisplayMode>[];
}

export function StandingsViewControls({
  mode,
  onSelectMode,
  viewModeOptions,
  scope,
  onSelectScope,
  scopeOptions,
  evolutionMode,
  onSelectEvolutionMode,
  evolutionModeOptions,
}: StandingsViewControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 1. Selector de modo de vista (Tabla / Distancia / Evolución) */}
      <div
        role="radiogroup"
        aria-label="Tipo de visualización"
        className="inline-flex self-start rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 sm:self-auto"
      >
        {viewModeOptions.map((opt) => {
          const isSelected = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectMode(opt.id)}
              className={`inline-flex min-h-[36px] items-center justify-center rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary)] text-white shadow-2xs font-bold"
                  : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 2. Selector contextual (Métricas de Evolución o Ámbito Local/Visitante) */}
      {mode === "evolution" ? (
        <div
          role="radiogroup"
          aria-label="Series de evolución"
          className="inline-flex self-start rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 sm:self-auto"
        >
          {evolutionModeOptions.map((opt) => {
            const isSelected = evolutionMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectEvolutionMode(opt.id)}
                className={`inline-flex min-h-[36px] items-center justify-center rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-2xs font-bold"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Filtro de ámbito"
          className="inline-flex self-start rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 sm:self-auto"
        >
          {scopeOptions.map((opt) => {
            const isSelected = scope === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectScope(opt.id)}
                className={`inline-flex min-h-[36px] items-center justify-center rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-2xs font-bold"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
