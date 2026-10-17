// Client: Mapa/explorador mundial por países de los rivales históricos
"use client";

import type { RegionRivalSummary } from "@/lib/historical/rivals-types";

interface WorldMapProps {
  readonly countrySummaries: readonly RegionRivalSummary[];
  readonly onSelectCountry: (countryName: string) => void;
  readonly selectedCountryName: string | null;
}

/**
 * World / International countries representation.
 * Displays countries with verified competitive matches in red borders,
 * and inactive countries clearly disabled.
 */
const NOTABLE_COUNTRIES: readonly { readonly id: string; readonly name: string; readonly flag: string }[] = [
  { id: "espana", name: "España", flag: "🇪🇸" },
  { id: "italia", name: "Italia", flag: "🇮🇹" },
  { id: "alemania", name: "Alemania", flag: "🇩🇪" },
  { id: "paises-bajos", name: "Países Bajos", flag: "🇳🇱" },
  { id: "republica-checa", name: "República Checa", flag: "🇨🇿" },
  { id: "serbia", name: "Serbia", flag: "🇷🇸" },
  { id: "rumania", name: "Rumanía", flag: "🇷🇴" },
  { id: "andorra", name: "Andorra", flag: "🇦🇩" },
  { id: "marruecos", name: "Marruecos", flag: "🇲🇦" },
  { id: "inglaterra", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "francia", name: "Francia", flag: "🇫🇷" },
  { id: "portugal", name: "Portugal", flag: "🇵🇹" },
  { id: "belgica", name: "Bélgica", flag: "🇧🇪" },
  { id: "escocia", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "suecia", name: "Suecia", flag: "🇸🇪" },
];

export function WorldMap({
  countrySummaries,
  onSelectCountry,
  selectedCountryName,
}: WorldMapProps) {
  const countryMap = new Map(countrySummaries.map((s) => [s.regionName.toLowerCase(), s]));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Países y Rivales Internacionales
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Enfrentamientos oficiales en competiciones de la UEFA y torneos de ámbito estatal.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-[var(--primary)] bg-white" /> Con partidos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-neutral-200 opacity-60" /> Sin partidos oficiales
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
        {NOTABLE_COUNTRIES.map((item) => {
          const summary = countryMap.get(item.name.toLowerCase());
          const hasMatches = Boolean(summary && summary.totalMatches > 0);
          const isSelected = selectedCountryName === item.name;

          if (!summary || !hasMatches) {
            return (
              <div
                key={item.id}
                title="Sin partidos oficiales disputados contra clubes de este país"
                className="flex flex-col justify-between rounded-xl border border-dashed border-neutral-200 bg-neutral-50/70 p-3 opacity-50 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.flag}</span>
                  <span className="text-xs font-semibold text-neutral-400">{item.name}</span>
                </div>
                <span className="mt-2 text-[10px] text-neutral-400">Sin partidos oficiales</span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCountry(item.name)}
              aria-pressed={isSelected}
              className={`flex flex-col justify-between text-left rounded-xl p-3 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
                isSelected
                  ? "bg-[var(--primary)] text-white shadow-xs border border-[var(--primary)]"
                  : "bg-white text-[var(--foreground)] border border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-neutral-50 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base">{item.flag}</span>
                  <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[var(--foreground)]"}`}>
                    {item.name}
                  </span>
                </div>
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
