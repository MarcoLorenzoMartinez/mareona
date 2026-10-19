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
      {/* Subcategory Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-sans transition-all active:scale-95 ${
                isSelected
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] font-semibold hover:border-neutral-300 hover:text-[var(--foreground)]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
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
