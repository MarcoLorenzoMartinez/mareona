// Client: Orquestador interactivo de la sección de Rivales
"use client";

import { useState, useMemo } from "react";
import type {
  RegionRivalSummary,
  RivalH2HSummary,
  RivalScopeFilter,
} from "@/lib/historical/rivals-types";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import type { HistoricalMatch } from "@/lib/historical/types";
import { filterRivals } from "@/lib/historical/rivals-service";
import { RivalsFilterBar } from "./rivals-filter-bar";
import { RivalCard } from "./rival-card";
import { RivalDetailView } from "./rival-detail-view";
import { RegionDetailView } from "./region-detail-view";
import { SpainMap } from "./spain-map";
import { WorldMap } from "./world-map";
import { HistoricalMatchDetailModal } from "../match-detail-modal";

interface RivalsHubProps {
  readonly allRivals: readonly RivalH2HSummary[];
  readonly communitySummaries: readonly RegionRivalSummary[];
  readonly countrySummaries: readonly RegionRivalSummary[];
}

/**
 * Main interactive hub for Historical Rivals & H2H exploration.
 * Manages view mode (List, Spain Map, World Map), live search, scope filters,
 * selected rival/region drills, and official match sheet modals.
 */
export function RivalsHub({
  allRivals,
  communitySummaries,
  countrySummaries,
}: RivalsHubProps) {
  const [activeTab, setActiveTab] = useState<"list" | "spain-map" | "world-map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScope, setActiveScope] = useState<RivalScopeFilter>("all");
  const [selectedRival, setSelectedRival] = useState<RivalH2HSummary | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionRivalSummary | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<DayMatchItem | null>(null);

  // Compute live filtered rivals based on query and scope
  const filteredRivals = useMemo(() => {
    return filterRivals(allRivals, searchQuery, activeScope);
  }, [allRivals, searchQuery, activeScope]);

  // Handle selection from Spain map
  const handleSelectCommunity = (communityName: string) => {
    const found = communitySummaries.find(
      (c) => c.regionName.toLowerCase() === communityName.toLowerCase()
    );
    if (found) {
      setSelectedRegion(found);
    }
  };

  // Handle selection from World map
  const handleSelectCountry = (countryName: string) => {
    const found = countrySummaries.find(
      (c) => c.regionName.toLowerCase() === countryName.toLowerCase()
    );
    if (found) {
      setSelectedRegion(found);
    }
  };

  const matchForModal: HistoricalMatch | null = selectedMatch
    ? {
        id: selectedMatch.id,
        date: selectedMatch.date,
        competition: selectedMatch.competition,
        round: selectedMatch.round,
        homeTeam: selectedMatch.homeTeam,
        homeCrestUrl: selectedMatch.homeCrestUrl,
        awayTeam: selectedMatch.awayTeam,
        awayCrestUrl: selectedMatch.awayCrestUrl,
        homeScore: selectedMatch.homeScore,
        awayScore: selectedMatch.awayScore,
        isHome: selectedMatch.isHome,
        outcome: selectedMatch.outcome,
        opponent: selectedMatch.opponent,
        venue: selectedMatch.venue,
        bdfMatchId: selectedMatch.bdfMatchId,
      }
    : null;

  // 1. Drilled down to a specific Rival Profile
  if (selectedRival) {
    return (
      <>
        <RivalDetailView
          rival={selectedRival}
          onBack={() => setSelectedRival(null)}
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
    );
  }

  // 2. Drilled down to a specific Region or Country
  if (selectedRegion) {
    return (
      <RegionDetailView
        region={selectedRegion}
        onBack={() => setSelectedRegion(null)}
        onSelectRival={(rival) => {
          setSelectedRegion(null);
          setSelectedRival(rival);
        }}
      />
    );
  }

  // 3. Main Explorer View (List / Spain Map / World Map)
  return (
    <div className="flex flex-col gap-5">
      <RivalsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeScope={activeScope}
        onScopeChange={setActiveScope}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalMatchesCount={allRivals.length}
        filteredRivalsCount={filteredRivals.length}
      />

      {activeTab === "list" && (
        <section aria-label="Lista alfabética de rivales">
          {filteredRivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredRivals.map((rival) => (
                <RivalCard key={rival.name} rival={rival} onSelect={setSelectedRival} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                No se encontraron rivales con esos criterios
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Prueba con otro término de búsqueda o selecciona el filtro &quot;Todos&quot;.
              </p>
            </div>
          )}
        </section>
      )}

      {activeTab === "spain-map" && (
        <SpainMap
          communitySummaries={communitySummaries}
          onSelectCommunity={handleSelectCommunity}
          selectedCommunityName={null}
        />
      )}

      {activeTab === "world-map" && (
        <WorldMap
          countrySummaries={countrySummaries}
          onSelectCountry={handleSelectCountry}
          selectedCountryName={null}
        />
      )}
    </div>
  );
}
