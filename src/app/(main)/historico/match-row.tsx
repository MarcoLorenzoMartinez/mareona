// Client: Fila de partido con tinte de competición y apertura interactiva de acta oficial
"use client";

import type { HistoricalMatch } from "@/lib/historical/types";
import { TeamCrest } from "@/components/media/team-crest";

interface MatchRowProps {
  readonly match: HistoricalMatch;
  readonly onSelect: (match: HistoricalMatch) => void;
}

function getCompetitionBg(comp: string): string {
  if (comp === "Copa UEFA") return "bg-indigo-50/30 hover:bg-indigo-100/40";
  if (comp === "Copa del Rey") return "bg-stone-50/80 hover:bg-stone-100/80";
  if (comp === "Promoción") return "bg-amber-50/40 hover:bg-amber-100/50";
  return "bg-white hover:bg-[var(--surface)]";
}

/**
 * Interactive match row that triggers match report modal on click or Enter key.
 */
export function HistoricalMatchRow({ match, onSelect }: MatchRowProps) {
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
      className={`grid grid-cols-[80px_1fr_56px_1fr_28px] sm:grid-cols-[180px_1fr_68px_1fr_130px] md:grid-cols-[220px_1fr_68px_1fr_150px] lg:grid-cols-[240px_1fr_68px_1fr_160px] items-center gap-1.5 sm:gap-2 py-3 px-2 rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${getCompetitionBg(
        match.competition
      )}`}
    >
      {/* 1. Round & Date */}
      <div className="flex flex-col min-w-0 pr-1">
        <span
          className="text-xs font-bold text-[var(--foreground)] truncate sm:whitespace-normal sm:line-clamp-2 leading-tight"
          title={match.round}
        >
          {match.round}
        </span>
        <span className="text-[11px] text-[var(--foreground-muted)] tabular-nums">
          {match.date}
        </span>
      </div>

      {/* 2. Home Team & Crest */}
      <div className="flex items-center justify-end gap-1.5 min-w-0 text-right">
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

      {/* 3. Centered Score Badge */}
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center w-full px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] font-black text-xs sm:text-sm tabular-nums text-[var(--foreground)] shadow-2xs group-hover:border-[var(--primary)]">
          {match.homeScore} - {match.awayScore}
        </div>
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
          className={`text-xs sm:text-sm truncate ${
            match.awayTeam === "Real Sporting"
              ? "font-bold text-[var(--primary)]"
              : "font-medium text-[var(--foreground)]"
          }`}
        >
          {match.awayTeam}
        </span>
      </div>

      {/* 5. Stadium & Outcome */}
      <div className="flex items-center gap-2 justify-end">
        {match.venue && (
          <span
            className="hidden md:inline-block text-[11px] text-[var(--foreground-muted)] truncate max-w-[105px] text-right"
            title={match.venue}
          >
            {match.venue}
          </span>
        )}
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
      </div>
    </div>
  );
}
