// Client: Orquestador interactivo de la sección de Rivales con mapas interactivos y preservación de scroll
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type {
  RegionRivalSummary, RivalH2HSummary, RivalLayoutMode, RivalScopeFilter, RivalSortOption,
} from "@/lib/historical/rivals-types";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import type { HistoricalMatch } from "@/lib/historical/types";
import { filterRivals, sortRivals } from "@/lib/historical/rivals-service";
import { RivalsFilterBar } from "./rivals-filter-bar";
import { RivalsListView } from "./rivals-list-view";
import { RivalDetailView } from "./rival-detail-view";
import { RivalsMapTabs } from "./rivals-map-tabs";
import { HistoricalMatchDetailModal } from "../match-detail-modal";

interface RivalsHubProps {
  readonly allRivals: readonly RivalH2HSummary[];
  readonly communitySummaries: readonly RegionRivalSummary[];
  readonly countrySummaries: readonly RegionRivalSummary[];
}

export function RivalsHub({
  allRivals,
  communitySummaries,
  countrySummaries,
}: RivalsHubProps) {
  const [activeTab, setActiveTab] = useState<"list" | "spain-map" | "world-map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScope, setActiveScope] = useState<RivalScopeFilter>("all");
  const [activeSort, setActiveSort] = useState<RivalSortOption>("alpha");
  const [layoutMode, setLayoutMode] = useState<RivalLayoutMode>("grid");
  const [selectedRival, setSelectedRival] = useState<RivalH2HSummary | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionRivalSummary | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<DayMatchItem | null>(null);
  const scrollYRef = useRef<number>(0);

  const sortedRivals = useMemo(() => {
    const filtered = filterRivals(allRivals, searchQuery, activeScope);
    return sortRivals(filtered, activeSort);
  }, [allRivals, searchQuery, activeScope, activeSort]);

  const handleSelectRival = (rival: RivalH2HSummary) => {
    scrollYRef.current = window.scrollY;
    setSelectedRival(rival);
    const url = new URL(window.location.href);
    url.searchParams.set("rival", rival.name);
    window.history.pushState({ rival: rival.name }, "", url.toString());
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleBackFromRival = () => {
    if (window.history.state?.rival) {
      window.history.back();
    } else {
      setSelectedRival(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("rival");
      window.history.replaceState({}, "", url.toString());
      requestAnimationFrame(() => window.scrollTo({ top: scrollYRef.current, behavior: "instant" }));
    }
  };

  const handleTabChange = (tab: "list" | "spain-map" | "world-map") => {
    setActiveTab(tab);
    setSelectedRegion(null);
  };

  useEffect(() => {
    const syncFromUrl = () => {
      const rivalName = new URLSearchParams(window.location.search).get("rival");
      if (rivalName) {
        const found = allRivals.find((r) => r.name.toLowerCase() === rivalName.toLowerCase());
        if (found) {
          setSelectedRival(found);
          return;
        }
      }
      setSelectedRival(null);
      requestAnimationFrame(() => window.scrollTo({ top: scrollYRef.current, behavior: "instant" }));
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [allRivals]);

  const handleSelectCommunity = (name: string) => {
    if (selectedRegion && selectedRegion.regionName.toLowerCase() === name.toLowerCase()) {
      setSelectedRegion(null);
      return;
    }
    const found = communitySummaries.find((c) => c.regionName.toLowerCase() === name.toLowerCase());
    if (found) setSelectedRegion(found);
  };

  const handleSelectCountry = (name: string) => {
    if (selectedRegion && selectedRegion.regionName.toLowerCase() === name.toLowerCase()) {
      setSelectedRegion(null);
      return;
    }
    const found = countrySummaries.find((c) => c.regionName.toLowerCase() === name.toLowerCase());
    if (found) setSelectedRegion(found);
  };

  const matchForModal: HistoricalMatch | null = selectedMatch
    ? {
        ...selectedMatch,
        outcome: selectedMatch.outcome === "V" || selectedMatch.outcome === "D" ? selectedMatch.outcome : "E",
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      {selectedRival && (
        <>
          <RivalDetailView
            key={selectedRival.name}
            rival={selectedRival}
            initialScope={activeScope}
            onBack={handleBackFromRival}
            onSelectMatch={setSelectedMatch}
          />
          {matchForModal && selectedMatch && (
            <HistoricalMatchDetailModal
              match={matchForModal}
              season={selectedMatch.season}
              onClose={() => setSelectedMatch(null)}
            />
          )}
        </>
      )}

      <div className={selectedRival ? "hidden" : "contents"}>
        <RivalsFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeScope={activeScope}
          onScopeChange={setActiveScope}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          totalMatchesCount={allRivals.length}
          filteredRivalsCount={sortedRivals.length}
        />

        {activeTab === "list" && (
          <section aria-label="Explorador de rivales del Sporting">
            <RivalsListView
              rivals={sortedRivals}
              layoutMode={layoutMode}
              activeSort={activeSort}
              onSortChange={setActiveSort}
              onSelect={handleSelectRival}
            />
          </section>
        )}

        {activeTab !== "list" && (
          <RivalsMapTabs
            activeTab={activeTab}
            communitySummaries={communitySummaries}
            countrySummaries={countrySummaries}
            selectedRegion={selectedRegion}
            onSelectCommunity={handleSelectCommunity}
            onSelectCountry={handleSelectCountry}
            onBackRegion={() => setSelectedRegion(null)}
            onSelectRival={handleSelectRival}
          />
        )}
      </div>
    </div>
  );
}
