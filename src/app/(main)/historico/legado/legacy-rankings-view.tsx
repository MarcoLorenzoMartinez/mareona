// Client: Vista de rankings históricos de futbolistas y entrenadores
"use client";

import { useState } from "react";
import type {
  LegacyCoachRecord,
  LegacyPlayerRecord,
} from "@/lib/historical/legacy-types";
import { LegacyRankingsTable } from "./legacy-rankings-table";
import { LegacyCoachesTable } from "./legacy-coaches-table";

interface LegacyRankingsViewProps {
  readonly topAppearances: readonly LegacyPlayerRecord[];
  readonly topScorers: readonly LegacyPlayerRecord[];
  readonly topSeasons: readonly LegacyPlayerRecord[];
  readonly topCoaches: readonly LegacyCoachRecord[];
}

type RankingCategory = "appearances" | "scorers" | "seasons" | "coaches";

const CATEGORIES: readonly { readonly id: RankingCategory; readonly label: string }[] = [
  { id: "appearances", label: "Más Partidos" },
  { id: "scorers", label: "Máximos Goleadores" },
  { id: "seasons", label: "Más Temporadas" },
  { id: "coaches", label: "Entrenadores" },
];

export function LegacyRankingsView({
  topAppearances,
  topScorers,
  topSeasons,
  topCoaches,
}: LegacyRankingsViewProps) {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>("appearances");

  const currentList =
    activeCategory === "appearances"
      ? topAppearances
      : activeCategory === "scorers"
      ? topScorers
      : topSeasons;

  return (
    <div className="flex flex-col gap-6">
      {/* Subcategory Segmented Control */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div
          role="tablist"
          aria-label="Categorías de récords históricos"
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-full px-3.5 py-1 text-xs font-sans transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
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
      </div>

      {/* Mode A: Coaches Ranking */}
      {activeCategory === "coaches" && (
        <LegacyCoachesTable coaches={topCoaches} />
      )}

      {/* Mode B: Player Rankings with Integrated Podium Table */}
      {activeCategory !== "coaches" && (
        <section aria-label="Ranking histórico de futbolistas" className="flex flex-col gap-6">
          <LegacyRankingsTable
            key={activeCategory}
            players={currentList}
            category={activeCategory}
          />
        </section>
      )}
    </div>
  );
}
