// Client: Fila interactiva de partido en efemérides con contexto histórico a la izquierda
"use client";

import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import { TeamCrest } from "@/components/media/team-crest";

interface EphemeridesMatchRowProps {
  readonly match: DayMatchItem;
  readonly onSelect: (match: DayMatchItem) => void;
}

function getCompetitionBg(comp: string): string {
  if (comp === "Copa UEFA") return "bg-red-50/35 hover:bg-red-100/45";
  if (comp === "Copa del Rey") return "bg-stone-50/80 hover:bg-stone-100/80";
  if (comp === "Promoción") return "bg-amber-50/40 hover:bg-amber-100/50";
  return "bg-white hover:bg-[var(--surface)]";
}

/**
 * Single match row formatted with Trayectoria grid, prominent year and competition context.
 */
export function EphemeridesMatchRow({ match, onSelect }: EphemeridesMatchRowProps) {
  const outcomeBadge = (
    <span
      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-black select-none ${
        match.outcome === "V"
          ? "bg-[#16a34a] text-white"
          : match.outcome === "E"
          ? "bg-neutral-200 text-neutral-800"
          : "bg-[#dc2626] text-white"
      }`}
      aria-label={
        match.outcome === "V"
          ? "Victoria"
          : match.outcome === "E"
          ? "Empate"
          : "Derrota"
      }
    >
      {match.outcome}
    </span>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(match)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(match);
        }
      }}
      aria-label={`Ver acta oficial: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`}
      className={`flex flex-col sm:grid sm:grid-cols-[180px_1fr_68px_1fr_130px] md:grid-cols-[210px_1fr_68px_1fr_150px] lg:grid-cols-[230px_1fr_68px_1fr_160px] sm:items-center gap-2 sm:gap-2 py-3 px-3 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${getCompetitionBg(
        match.competition
      )}`}
    >
      {/* Mobile Top Context Row (Year, Competition, Round & Outcome Badge) */}
      <div className="flex sm:hidden items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-white font-sans tabular-nums shadow-2xs shrink-0">
            {match.year}
          </span>
          <div className="flex items-center gap-1.5 min-w-0 text-[11px] leading-tight">
            <span className="font-semibold text-[var(--foreground)] truncate">
              {match.competition}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-[var(--muted-foreground)] truncate font-sans tabular-nums">
              {match.round} ({match.season})
            </span>
          </div>
        </div>
        <div className="shrink-0">{outcomeBadge}</div>
      </div>

      {/* Main confrontation row: On mobile flex-1 full width, on desktop sm:contents */}
      <div className="flex sm:contents items-center justify-between gap-1.5 min-w-0">
        {/* 1. Desktop Context: Year (red rounded badge), Competition, Round & Season */}
        <div className="hidden sm:flex flex-col items-start min-w-0 pr-1 gap-1">
          <span className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white font-sans tabular-nums shadow-2xs">
            {match.year}
          </span>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--foreground)] truncate">
              {match.competition}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate font-sans tabular-nums">
              {match.round} · {match.season}
            </span>
          </div>
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
            {match.homeScore} - {match.awayScore}
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

        {/* 5. Desktop Stadium & Outcome */}
        <div className="hidden sm:flex items-center gap-2 justify-end">
          {match.venue && (
            <span
              className="hidden md:inline-block text-[11px] text-[var(--muted-foreground)] truncate max-w-[105px] text-right"
              title={match.venue}
            >
              {match.venue}
            </span>
          )}
          {outcomeBadge}
        </div>
      </div>
    </div>
  );
}
