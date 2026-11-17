"use client";
// Client: Match detail tabs navigation and view switching

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import type { RivalH2HSummary } from "@/lib/historical/rivals-types";
import { getDictionary } from "@/i18n";
import { MatchEventsTimeline } from "./match-events-timeline";
import { MatchStatsPanel } from "./match-stats-panel";
import { MatchLineupsView } from "./match-lineups-view";
import { MatchCommunityTab } from "./match-community-tab";
import { MatchH2HPreview } from "./match-h2h-preview";

interface MatchTabsProps {
  readonly match: DomainMatchDetail;
  readonly rivalH2H?: RivalH2HSummary | null;
}

type TabKey = "h2h" | "events" | "stats" | "lineups" | "grada";

export function MatchTabs({ match, rivalH2H = null }: MatchTabsProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.tabs;
  const searchParams = useSearchParams();

  const isScheduled = match.status === "scheduled";
  const isLineupParam = searchParams?.get("adjuntarOnce") === "1";
  const requestedTab = searchParams?.get("tab") as TabKey | null;

  // Prioritize "grada" when sharing a lineup or when explicitly requested via URL
  const resolveInitialTab = (): TabKey => {
    if (isLineupParam || requestedTab === "grada") return "grada";
    if (requestedTab && ["h2h", "events", "stats", "lineups", "grada"].includes(requestedTab)) {
      return requestedTab;
    }
    return isScheduled ? "h2h" : "events";
  };

  const [activeTab, setActiveTab] = useState<TabKey>(resolveInitialTab);
  const [prevLineupParam, setPrevLineupParam] = useState(isLineupParam);

  // Synchronously switch to "grada" if navigating with ?adjuntarOnce=1 when already mounted
  if (isLineupParam && !prevLineupParam) {
    setPrevLineupParam(true);
    setActiveTab("grada");
  } else if (!isLineupParam && prevLineupParam) {
    setPrevLineupParam(false);
  }

  const tabs: Array<{ key: TabKey; label: string }> = isScheduled
    ? [
        { key: "h2h", label: t.h2h },
        { key: "lineups", label: t.lineups },
        { key: "grada", label: t.grada },
      ]
    : [
        { key: "events", label: t.events },
        { key: "stats", label: t.stats },
        { key: "lineups", label: t.lineups },
        { key: "grada", label: t.grada },
      ];

  const currentTab = !isScheduled && activeTab === "h2h" ? "events" : activeTab;
  const opponent = match.homeTeam.isSporting ? match.awayTeam : match.homeTeam;

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de pestañas */}
      <div className="flex justify-center overflow-x-auto pb-1">
        <div
          role="tablist"
          aria-label="Vistas del partido"
          className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
        >
          {tabs.map((tab) => {
            const isSelected = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-[40px] min-w-[80px] cursor-pointer rounded-full px-4 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-2xs"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div
        role="tabpanel"
        id={`panel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
      >
        {isScheduled && currentTab === "h2h" && (
          <MatchH2HPreview
            rival={rivalH2H}
            opponentName={opponent.name}
            opponentCrestUrl={opponent.crestUrl}
          />
        )}
        {currentTab === "events" && <MatchEventsTimeline match={match} />}
        {currentTab === "stats" && <MatchStatsPanel match={match} />}
        {currentTab === "lineups" && <MatchLineupsView match={match} />}
        {currentTab === "grada" && <MatchCommunityTab match={match} />}
      </div>
    </div>
  );
}
