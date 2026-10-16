// Client: Filtros interactivos de partidos por competición y condición de campo
"use client";

import { useState, useMemo } from "react";
import type { HistoricalMatch } from "@/lib/historical/types";
import { TeamCrest } from "@/components/media/team-crest";

interface SeasonMatchesProps {
  readonly matches: readonly HistoricalMatch[];
  readonly seasonLabel: string;
}

type VenueFilter = "all" | "home" | "away";

const VENUE_OPTIONS: readonly { readonly id: VenueFilter; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "home", label: "Casa" },
  { id: "away", label: "Fuera" },
];

function getCompetitionBg(comp: string): string {
  if (comp === "Copa UEFA") return "bg-indigo-50/30 hover:bg-indigo-100/40";
  if (comp === "Copa del Rey") return "bg-stone-50/80 hover:bg-stone-100/80";
  if (comp === "Promoción") return "bg-amber-50/40 hover:bg-amber-100/50";
  return "bg-white hover:bg-[var(--surface)]";
}

/**
 * Interactive match calendar for a historical season with competition and venue filters,
 * compact matchday cards, team crests, and sports outcome pills.
 */
export function HistoricalSeasonMatches({ matches, seasonLabel }: SeasonMatchesProps) {
  const [compFilter, setCompFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");

  const competitions = useMemo(() => {
    return ["all", ...new Set(matches.map((m) => m.competition))];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (compFilter !== "all" && m.competition !== compFilter) return false;
      if (venueFilter === "home" && !m.isHome) return false;
      if (venueFilter === "away" && m.isHome) return false;
      return true;
    });
  }, [matches, compFilter, venueFilter]);

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--foreground-muted)]">
        No se dispone de actas de partidos registradas para la temporada {seasonLabel}.
      </div>
    );
  }

  return (
    <section aria-label={`Partidos oficiales del Real Sporting ${seasonLabel}`} className="w-full rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        {/* Competitions */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar por competición">
          {competitions.map((comp) => (
            <button
              key={comp}
              type="button"
              role="tab"
              aria-selected={compFilter === comp}
              onClick={() => setCompFilter(comp)}
              className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                compFilter === comp
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
              }`}
            >
              {comp === "all" ? "Todas" : comp}
            </button>
          ))}
        </div>

        {/* Venue (Casa / Fuera) */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Filtrar por sede">
          {VENUE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={venueFilter === item.id}
              onClick={() => setVenueFilter(item.id)}
              className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                venueFilter === item.id
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match List */}
      <div className="divide-y divide-[var(--border)] mt-1">
        {filteredMatches.map((m) => (
          <div
            key={m.id}
            className={`grid grid-cols-[80px_1fr_56px_1fr_28px] sm:grid-cols-[180px_1fr_68px_1fr_130px] md:grid-cols-[220px_1fr_68px_1fr_150px] lg:grid-cols-[240px_1fr_68px_1fr_160px] items-center gap-1.5 sm:gap-2 py-3 px-2 rounded-lg transition-colors ${getCompetitionBg(
              m.competition
            )}`}
          >
            {/* 1. Round & Date */}
            <div className="flex flex-col min-w-0 pr-1">
              <span
                className="text-xs font-bold text-[var(--foreground)] truncate sm:whitespace-normal sm:line-clamp-2 leading-tight"
                title={m.round}
              >
                {m.round}
              </span>
              <span className="text-[11px] text-[var(--foreground-muted)] tabular-nums">
                {m.date}
              </span>
            </div>

            {/* 2. Home Team & Crest */}
            <div className="flex items-center justify-end gap-1.5 min-w-0 text-right">
              <span className={`text-xs sm:text-sm truncate ${m.homeTeam === "Real Sporting" ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--foreground)]"}`}>
                {m.homeTeam}
              </span>
              <TeamCrest crestUrl={m.homeCrestUrl} teamName={m.homeTeam} size="sm" isSporting={m.homeTeam === "Real Sporting"} />
            </div>

            {/* 3. Centered Score Badge */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-full px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] font-black text-xs sm:text-sm tabular-nums text-[var(--foreground)]">
                {m.homeScore} - {m.awayScore}
              </div>
            </div>

            {/* 4. Away Team & Crest */}
            <div className="flex items-center justify-start gap-1.5 min-w-0 text-left">
              <TeamCrest crestUrl={m.awayCrestUrl} teamName={m.awayTeam} size="sm" isSporting={m.awayTeam === "Real Sporting"} />
              <span className={`text-xs sm:text-sm truncate ${m.awayTeam === "Real Sporting" ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--foreground)]"}`}>
                {m.awayTeam}
              </span>
            </div>

            {/* 5. Stadium & Outcome */}
            <div className="flex items-center gap-2 justify-end">
              {m.venue && (
                <span className="hidden md:inline-block text-[11px] text-[var(--foreground-muted)] truncate max-w-[105px] text-right" title={m.venue}>
                  {m.venue}
                </span>
              )}
              <span
                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-black select-none ${
                  m.outcome === "V" ? "bg-[#16a34a] text-white" : m.outcome === "E" ? "bg-neutral-200 text-neutral-800" : "bg-[#dc2626] text-white"
                }`}
                aria-label={m.outcome === "V" ? "Victoria" : m.outcome === "E" ? "Empate" : "Derrota"}
              >
                {m.outcome}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
