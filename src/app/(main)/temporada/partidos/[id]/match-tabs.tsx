"use client";
// Client: Match detail tabs navigation and view switching

import { useState } from "react";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchEventsTimeline } from "./match-events-timeline";
import { MatchStatsPanel } from "./match-stats-panel";
import { MatchLineupsView } from "./match-lineups-view";
import { MatchCommunityTab } from "./match-community-tab";

interface MatchTabsProps {
  readonly match: DomainMatchDetail;
}

type TabKey = "events" | "stats" | "lineups" | "grada";

export function MatchTabs({ match }: MatchTabsProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.tabs;

  // For finished/live matches, start on events (or stats). For scheduled, start on lineups.
  const initialTab: TabKey =
    match.status === "scheduled" ? "lineups" : "events";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "events", label: t.events },
    { key: "stats", label: t.stats },
    { key: "lineups", label: t.lineups },
    { key: "grada", label: t.grada },
  ];

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
            const isSelected = activeTab === tab.key;
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
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "events" && <MatchEventsTimeline match={match} />}
        {activeTab === "stats" && <MatchStatsPanel match={match} />}
        {activeTab === "lineups" && <MatchLineupsView match={match} />}
        {activeTab === "grada" && <MatchCommunityTab match={match} />}
      </div>
    </div>
  );
}
