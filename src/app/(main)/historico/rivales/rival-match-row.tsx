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
  if (outcome === "V") {
    return <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">V</span>;
  }
  if (outcome === "E") {
    return <span className="rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[10px] font-bold">E</span>;
  }
  if (outcome === "D") {
    return <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">D</span>;
  }
  return null;
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
      className="grid grid-cols-[100px_1fr_56px_1fr_40px] sm:grid-cols-[160px_1fr_68px_1fr_110px] items-center gap-2 py-2.5 px-3 cursor-pointer hover:bg-neutral-50 border-b border-[var(--border)]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] text-xs"
    >
      {/* 1. Date, Season & Competition Context */}
      <div className="flex flex-col min-w-0 pr-1">
        <span className="font-bold text-[var(--foreground)] truncate font-sans tabular-nums">
          {match.date}
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)] truncate font-sans tabular-nums">
          {match.competition} · {match.season}
        </span>
      </div>

      {/* 2. Home Team & Crest */}
      <div className="flex items-center justify-end gap-1.5 min-w-0 text-right">
        <span
          className={`truncate ${
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

      {/* 3. Score Badge */}
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center justify-center rounded-md bg-neutral-100 px-2 py-0.5 font-sans text-xs font-black tabular-nums text-neutral-900 shadow-2xs">
          {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
        </span>
      </div>

      {/* 4. Away Team & Crest */}
      <div className="flex items-center justify-start gap-1.5 min-w-0 text-left">
        <TeamCrest
          crestUrl={match.awayCrestUrl}
          teamName={match.awayTeam}
          size="sm"
          isSporting={match.awayTeam === "Real Sporting"}
        />
        <span
          className={`truncate ${
            match.awayTeam === "Real Sporting"
              ? "font-bold text-[var(--primary)]"
              : "font-medium text-[var(--foreground)]"
          }`}
        >
          {match.awayTeam}
        </span>
      </div>

      {/* 5. Outcome Badge & Round */}
      <div className="flex items-center justify-end gap-1.5 min-w-0">
        <span className="hidden sm:inline-block text-[10px] text-neutral-400 truncate">
          {match.round}
        </span>
        {getOutcomeBadge(match.outcome)}
      </div>
    </div>
  );
}
