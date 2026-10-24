"use client"; // Client: Píldoras de multiselección de categorías y décadas para la cuadrícula

import type { CardDecade } from "@/lib/cards/types";
import { CARD_DECADES } from "@/lib/cards/schemas";
import type { SpecialCategory } from "./grid-filter-types.ts";

interface GridFilterCategoriesProps {
  readonly selectedDecades: ReadonlySet<CardDecade>;
  readonly selectedCategories: ReadonlySet<SpecialCategory>;
  readonly isAllActive: boolean;
  readonly duplicateCount?: number;
  readonly onToggleCategory: (cat: SpecialCategory) => void;
  readonly onToggleDecade: (dec: CardDecade) => void;
  readonly onReset: () => void;
}

const SECTION_OPTIONS: readonly { readonly id: SpecialCategory; readonly label: string }[] = [
  { id: "crests", label: "Identidad" },
  { id: "moments", label: "Momentos" },
];

export function GridFilterCategories({
  selectedDecades,
  selectedCategories,
  isAllActive,
  duplicateCount = 0,
  onToggleCategory,
  onToggleDecade,
  onReset,
}: GridFilterCategoriesProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {/* Opción 'Todas' */}
      <button
        type="button"
        onClick={onReset}
        className={`rounded-full px-3 py-1 font-bold transition-colors ${
          isAllActive
            ? "bg-[#e2001a] text-white shadow-2xs"
            : "border border-[var(--border)] bg-white text-neutral-700 hover:border-[#e2001a]/50"
        }`}
      >
        Todas
      </button>

      {/* Duplicados */}
      <button
        type="button"
        onClick={() => onToggleCategory("duplicates")}
        className={`flex items-center gap-1 rounded-full px-3 py-1 font-bold transition-colors ${
          selectedCategories.has("duplicates")
            ? "bg-[#e2001a] text-white shadow-2xs"
            : "border border-[var(--border)] bg-white text-neutral-700 hover:border-[#e2001a]/50"
        }`}
      >
        <span>Duplicados</span>
        {duplicateCount > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              selectedCategories.has("duplicates") ? "bg-white text-[#e2001a]" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {duplicateCount}
          </span>
        )}
      </button>

      {/* Secciones Especiales: Identidad y Momentos */}
      {SECTION_OPTIONS.map((sec) => {
        const isSelected = sec.id === "crests"
          ? selectedCategories.has("crests")
          : selectedCategories.has(sec.id);
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onToggleCategory(sec.id)}
            className={`rounded-full px-3 py-1 font-bold transition-colors ${
              isSelected
                ? "bg-[#e2001a] text-white shadow-2xs"
                : "border border-[var(--border)] bg-white text-neutral-700 hover:border-[#e2001a]/50"
            }`}
          >
            {sec.label}
          </button>
        );
      })}

      {/* Separador tenue */}
      <span className="hidden sm:inline-block h-3.5 w-px bg-neutral-200 mx-0.5" aria-hidden="true" />

      {/* Multiselección de Décadas */}
      {CARD_DECADES.map((dec) => {
        const isSelected = selectedDecades.has(dec);
        return (
          <button
            key={dec}
            type="button"
            onClick={() => onToggleDecade(dec)}
            className={`rounded-full px-2.5 sm:px-3 py-1 font-bold transition-colors ${
              isSelected
                ? "bg-[#e2001a] text-white shadow-2xs"
                : "border border-[var(--border)] bg-white text-neutral-700 hover:border-[#e2001a]/50"
            }`}
          >
            {dec}
          </button>
        );
      })}
    </div>
  );
}
