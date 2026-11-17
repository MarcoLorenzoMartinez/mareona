// Client: Píldoras de filtrado por categoría y posición para la plantilla
"use client";

import type { PlayerCategory } from "@/lib/lineup-builder/types";

interface RosterFilterPillsProps {
  readonly selectedCategory: PlayerCategory | "all";
  readonly onSelectCategory: (cat: PlayerCategory | "all") => void;
  readonly selectedPosition: string;
  readonly onSelectPosition: (pos: string) => void;
}

const CATEGORIES: readonly { readonly key: PlayerCategory | "all"; readonly label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "first_team", label: "1er Equipo" },
  { key: "filial", label: "Sporting At." },
  { key: "juvenil", label: "Juvenil DH" },
];

const POSITIONS = ["all", "POR", "DEF", "MED", "DEL"] as const;

export function RosterFilterPills({
  selectedCategory,
  onSelectCategory,
  selectedPosition,
  onSelectPosition,
}: RosterFilterPillsProps) {
  return (
    <>
      <div
        role="radiogroup"
        aria-label="Filtrar por categoría"
        className="mt-2.5 flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 overflow-x-auto scrollbar-none"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex-1 rounded-full px-2.5 py-1 text-[11px] whitespace-nowrap transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div
        role="radiogroup"
        aria-label="Filtrar por línea táctica"
        className="mt-2 flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
      >
        {POSITIONS.map((pos) => {
          const isSelected = selectedPosition === pos;
          return (
            <button
              key={pos}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPosition(pos)}
              className={`flex-1 rounded-full px-2 py-0.5 text-[10px] transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
              }`}
            >
              {pos === "all" ? "Líneas" : pos}
            </button>
          );
        })}
      </div>
    </>
  );
}
