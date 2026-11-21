// Client: Fila de partido en el historial cara a cara con apertura de acta oficial
"use client";

import type { RivalH2HMatch } from "@/lib/historical/rivals-types";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import { TeamCrest } from "@/components/media/team-crest";

interface RivalMatchRowProps {
  readonly match: RivalH2HMatch;
  readonly onSelect: (match: DayMatchItem) => void;
}

function getOutcomeBadge(outcome: "V" | "E" | "D" | "PENDIENTE") {
  if (outcome === "PENDIENTE") return null;
  return (
    <span
      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-black select-none ${
        outcome === "V"
          ? "bg-[#16a34a] text-white"
          : outcome === "E"
          ? "bg-neutral-200 text-neutral-800"
          : "bg-[#dc2626] text-white"
      }`}
      aria-label={
        outcome === "V"
          ? "Victoria"
          : outcome === "E"
          ? "Empate"
          : "Derrota"
      }
    >
      {outcome}
    </span>
  );
}

/**
 * Match row for H2H list, consistent with ephemerides/trayectoria rows.
 */
export function RivalMatchRow({ match, onSelect }: RivalMatchRowProps) {
  const dayMatchAdapter: DayMatchItem = {
    id: match.id,
    bdfMatchId: match.bdfMatchId,
    season: match.season,
    date: match.date,
    year: match.year,
    competition: match.competition,
    round: match.round,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    isHome: match.isHome,
    outcome: match.outcome === "V" || match.outcome === "E" || match.outcome === "D" ? match.outcome : "E",
    opponent: match.isHome ? match.awayTeam : match.homeTeam,
    venue: match.venue,
    homeCrestUrl: match.homeCrestUrl ?? null,
    awayCrestUrl: match.awayCrestUrl ?? null,
  };

  const outcomeBadge = getOutcomeBadge(match.outcome);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(dayMatchAdapter)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(dayMatchAdapter);
        }
      }}
      aria-label={`Ver acta oficial: ${match.homeTeam} ${match.homeScore ?? "-"} - ${match.awayScore ?? "-"} ${match.awayTeam}`}
      className="flex flex-col sm:grid sm:grid-cols-[160px_1fr_68px_1fr_110px] sm:items-center gap-2 py-3 px-3 cursor-pointer hover:bg-neutral-50 border-b border-[var(--border)]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] text-xs"
    >
      {/* Mobile Top Context Row (Date, Competition & Outcome Badge) */}
      <div className="flex sm:hidden items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-[var(--foreground)] font-sans tabular-nums shrink-0">
            {match.date}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-[var(--muted-foreground)] truncate font-sans tabular-nums">
            {match.competition} ({match.season})
          </span>
        </div>
        <div className="shrink-0">{outcomeBadge}</div>
      </div>

      {/* Main confrontation row: On mobile flex-1 full width, on desktop sm:contents */}
      <div className="flex sm:contents items-center justify-between gap-1.5 min-w-0">
        {/* 1. Desktop Date, Season & Competition Context */}
        <div className="hidden sm:flex flex-col min-w-0 pr-1">
          <span className="font-bold text-[var(--foreground)] truncate font-sans tabular-nums">
            {match.date}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] truncate font-sans tabular-nums">
            {match.competition} ({match.season})
          </span>
        </div>

        {/* 2. Home Team & Crest */}
        <div className="flex-1 sm:flex-initial flex items-center justify-end gap-1.5 min-w-0 text-right">
          <span
            className={`text-xs sm:text-sm truncate ${
              match.homeTeam === "Real Sporting"
                ? "font-bold text-[var(--primary)]"
                : "font-medium text-[var(--foreground)]"
            }`}
          >
            {match.homeTeam}
          </span>
          <TeamCrest
            crestUrl={match.homeCrestUrl}
            teamName={match.homeTeam}
            size="sm"
            isSporting={match.homeTeam === "Real Sporting"}
          />
        </div>

        {/* 3. Scoreboard Tile Badge */}
        <div className="flex items-center justify-center shrink-0 px-1">
          <span className="inline-flex items-center justify-center rounded-md bg-neutral-100 px-2 py-0.5 font-sans text-xs sm:text-sm font-black tabular-nums text-neutral-900 border border-neutral-200/60 shadow-2xs">
            {match.homeScore ?? "-"} - {match.awayScore ?? "-"}
          </span>
        </div>

        {/* 4. Away Team & Crest */}
        <div className="flex-1 sm:flex-initial flex items-center justify-start gap-1.5 min-w-0 text-left">
          <TeamCrest
            crestUrl={match.awayCrestUrl}
            teamName={match.awayTeam}
            size="sm"
            isSporting={match.awayTeam === "Real Sporting"}
          />
          <span
            className={`text-xs sm:text-sm truncate ${
              match.awayTeam === "Real Sporting"
                ? "font-bold text-[var(--primary)]"
                : "font-medium text-[var(--foreground)]"
            }`}
          >
            {match.awayTeam}
          </span>
        </div>

        {/* 5. Desktop Outcome Badge & Round */}
        <div className="hidden sm:flex items-center justify-end gap-1.5 min-w-0">
          <span className="hidden sm:inline-block text-[10px] text-neutral-600 truncate">
            {match.round}
          </span>
          {outcomeBadge}
        </div>
      </div>
    </div>
  );
}
