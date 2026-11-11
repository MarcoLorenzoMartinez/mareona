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
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelectCategory(cat.key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? "bg-[#e2001a] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => onSelectPosition(pos)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
              selectedPosition === pos
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            }`}
          >
            {pos === "all" ? "Líneas" : pos}
          </button>
        ))}
      </div>
    </>
  );
}
