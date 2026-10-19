// Client: Pestañas de mapas (España y Mundo) con vista contextual de región
"use client";

import type { RegionRivalSummary, RivalH2HSummary } from "@/lib/historical/rivals-types";
import { SpainMap } from "./spain-map";
import { WorldMap } from "./world-map";
import { RegionDetailView } from "./region-detail-view";

interface RivalsMapTabsProps {
  readonly activeTab: "spain-map" | "world-map";
  readonly communitySummaries: readonly RegionRivalSummary[];
  readonly countrySummaries: readonly RegionRivalSummary[];
  readonly selectedRegion: RegionRivalSummary | null;
  readonly onSelectCommunity: (name: string) => void;
  readonly onSelectCountry: (name: string) => void;
  readonly onBackRegion: () => void;
  readonly onSelectRival: (rival: RivalH2HSummary) => void;
}

/**
 * Renders interactive SVG geographical maps (Spain / World) and embedded regional drilldowns.
 * Conforms to AGENTS.md rule 5: strictly <= 180 lines.
 */
export function RivalsMapTabs({
  activeTab,
  communitySummaries,
  countrySummaries,
  selectedRegion,
  onSelectCommunity,
  onSelectCountry,
  onBackRegion,
  onSelectRival,
}: RivalsMapTabsProps) {
  if (activeTab === "spain-map") {
    return (
      <div className="flex flex-col gap-6">
        <SpainMap
          communitySummaries={communitySummaries}
          onSelectCommunity={onSelectCommunity}
          selectedCommunityName={selectedRegion && !selectedRegion.isCountry ? selectedRegion.regionName : null}
        />
        {selectedRegion && !selectedRegion.isCountry && (
          <RegionDetailView
            region={selectedRegion}
            onBack={onBackRegion}
            onSelectRival={onSelectRival}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <WorldMap
        countrySummaries={countrySummaries}
        onSelectCountry={onSelectCountry}
        selectedCountryName={selectedRegion && selectedRegion.isCountry ? selectedRegion.regionName : null}
      />
      {selectedRegion && selectedRegion.isCountry && (
        <RegionDetailView
          region={selectedRegion}
          onBack={onBackRegion}
          onSelectRival={onSelectRival}
        />
      )}
    </div>
  );
}
