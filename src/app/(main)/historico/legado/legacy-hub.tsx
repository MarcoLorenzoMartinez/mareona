// Client: Orquestador interactivo principal para la sección de Legado
"use client";

import { useState } from "react";
import type {
  IndividualAward,
  LegacyPlayerRecord,
  LegacyTab,
  LegendProfile,
} from "@/lib/historical/legacy-types";
import { LegacyFilterBar } from "./legacy-filter-bar";
import { LegacyRankingsView } from "./legacy-rankings-view";
import { LegacyLegendsWall } from "./legacy-legends-wall";

interface LegacyHubProps {
  readonly topAppearances: readonly LegacyPlayerRecord[];
  readonly topScorers: readonly LegacyPlayerRecord[];
  readonly topSeasons: readonly LegacyPlayerRecord[];
  readonly individualAwards: readonly IndividualAward[];
  readonly legends: readonly LegendProfile[];
}

export function LegacyHub({
  topAppearances,
  topScorers,
  topSeasons,
  individualAwards,
  legends,
}: LegacyHubProps) {
  const [activeTab, setActiveTab] = useState<LegacyTab>("records");

  return (
    <div className="flex flex-col gap-6">
      <LegacyFilterBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab 1: Records & Individual Awards */}
      {activeTab === "records" && (
        <LegacyRankingsView
          topAppearances={topAppearances}
          topScorers={topScorers}
          topSeasons={topSeasons}
          individualAwards={individualAwards}
        />
      )}

      {/* Tab 2: Legends Wall */}
      {activeTab === "legends" && (
        <LegacyLegendsWall legends={legends} />
      )}
    </div>
  );
}

