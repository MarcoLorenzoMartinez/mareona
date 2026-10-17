// Client: Mapa interactivo de España dividido en Comunidades Autónomas
"use client";

import type { RegionRivalSummary } from "@/lib/historical/rivals-types";

interface SpainMapProps {
  readonly communitySummaries: readonly RegionRivalSummary[];
  readonly onSelectCommunity: (communityName: string) => void;
  readonly selectedCommunityName: string | null;
}

/**
 * Spanish autonomous communities representation.
 * Follows AGENTS.md aesthetic:
 * - White map background
 * - Fine red border lines (border-[var(--primary)] / stroke-[#e2001a])
 * - Active community highlighted in Sporting red (bg-[#e2001a] text-white)
 * - Clear visual distinction for communities with and without matches (Melilla has 0).
 */
const ALL_SPANISH_REGIONS: readonly { readonly id: string; readonly name: string; readonly shortName: string }[] = [
  { id: "principado-de-asturias", name: "Principado de Asturias", shortName: "Asturias" },
  { id: "galicia", name: "Galicia", shortName: "Galicia" },
  { id: "cantabria", name: "Cantabria", shortName: "Cantabria" },
  { id: "pais-vasco", name: "País Vasco", shortName: "País Vasco" },
  { id: "navarra", name: "Navarra", shortName: "Navarra" },
  { id: "la-rioja", name: "La Rioja", shortName: "La Rioja" },
  { id: "aragon", name: "Aragón", shortName: "Aragón" },
  { id: "cataluna", name: "Cataluña", shortName: "Cataluña" },
  { id: "castilla-y-leon", name: "Castilla y León", shortName: "Castilla y León" },
  { id: "comunidad-de-madrid", name: "Comunidad de Madrid", shortName: "Madrid" },
  { id: "castilla-la-mancha", name: "Castilla-La Mancha", shortName: "Castilla-La Mancha" },
  { id: "comunitat-valenciana", name: "Comunitat Valenciana", shortName: "C. Valenciana" },
  { id: "extremadura", name: "Extremadura", shortName: "Extremadura" },
  { id: "andalucia", name: "Andalucía", shortName: "Andalucía" },
  { id: "region-de-murcia", name: "Región de Murcia", shortName: "Murcia" },
  { id: "illes-balears", name: "Illes Balears", shortName: "Baleares" },
  { id: "canarias", name: "Canarias", shortName: "Canarias" },
  { id: "ceuta", name: "Ceuta", shortName: "Ceuta" },
  { id: "melilla", name: "Melilla", shortName: "Melilla" },
];

export function SpainMap({
  communitySummaries,
  onSelectCommunity,
  selectedCommunityName,
}: SpainMapProps) {
  const summaryMap = new Map(communitySummaries.map((s) => [s.regionName.toLowerCase(), s]));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Comunidades Autónomas
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Selecciona una comunidad para consultar el cara a cara contra todos sus equipos.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-[var(--primary)] bg-white" /> Con partidos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-neutral-200 opacity-60" /> Sin enfrentamientos
          </span>
        </div>
      </div>

      {/* Grid of Interactive Community Tiles with Fine Red Borders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
        {ALL_SPANISH_REGIONS.map((region) => {
          const summary = summaryMap.get(region.name.toLowerCase());
          const hasMatches = Boolean(summary && summary.totalMatches > 0);
          const isSelected = selectedCommunityName === region.name;

          if (!summary || !hasMatches) {
            return (
              <div
                key={region.id}
                title="Sin partidos oficiales disputados frente a clubes de esta comunidad"
                className="flex flex-col justify-between rounded-xl border border-dashed border-neutral-200 bg-neutral-50/70 p-3 opacity-50 cursor-not-allowed select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">{region.shortName}</span>
                  <span className="text-[10px] font-bold text-neutral-400">0</span>
                </div>
                <span className="mt-2 text-[10px] text-neutral-400">Sin rivales</span>
              </div>
            );
          }

          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectCommunity(region.name)}
              aria-pressed={isSelected}
              className={`flex flex-col justify-between text-left rounded-xl p-3 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary)] text-white shadow-xs border border-[var(--primary)]"
                  : "bg-white text-[var(--foreground)] border border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-neutral-50 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[var(--foreground)]"}`}>
                  {region.shortName}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black font-sans tabular-nums ${
                  isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-900"
                }`}>
                  {summary.totalMatches} PJ
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-sans tabular-nums">
                <span className={`text-[10px] font-medium truncate ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                  {summary.totalRivals} {summary.totalRivals === 1 ? "rival" : "rivales"}
                </span>
                <span className={`font-black ${isSelected ? "text-white" : "text-neutral-900"}`}>
                  {summary.won}V - {summary.drawn}E - {summary.lost}D
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
