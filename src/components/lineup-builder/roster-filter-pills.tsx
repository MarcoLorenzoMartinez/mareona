// Client: Píldoras de filtrado por categoría y posición para la plantilla
"use client";

import type { PlayerCategory } from "@/lib/lineup-builder/types";
import { getDictionary } from "@/i18n";

interface RosterFilterPillsProps {
  readonly selectedCategory: PlayerCategory | "all";
  readonly onSelectCategory: (cat: PlayerCategory | "all") => void;
  readonly selectedPosition: string;
  readonly onSelectPosition: (pos: string) => void;
}

const POSITIONS = ["all", "POR", "DEF", "MED", "DEL"] as const;

export function RosterFilterPills({
  selectedCategory,
  onSelectCategory,
  selectedPosition,
  onSelectPosition,
}: RosterFilterPillsProps) {
  const dict = getDictionary();
  const categories: readonly { readonly key: PlayerCategory | "all"; readonly label: string }[] = [
    { key: "all", label: dict.lineupBuilder.roster.categories.all },
    { key: "first_team", label: dict.lineupBuilder.roster.categories.firstTeam },
    { key: "filial", label: dict.lineupBuilder.roster.categories.filial },
    { key: "juvenil", label: dict.lineupBuilder.roster.categories.juvenil },
  ];

  return (
    <>
      <div
        role="radiogroup"
        aria-label={dict.lineupBuilder.roster.categoryAria}
        className="mt-2.5 flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 overflow-x-auto scrollbar-none"
      >
        {categories.map((cat) => {
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
        aria-label={dict.lineupBuilder.roster.positionAria}
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
              {pos === "all" ? dict.lineupBuilder.roster.allPositionsLabel : pos}
            </button>
          );
        })}
      </div>
    </>
  );
}
