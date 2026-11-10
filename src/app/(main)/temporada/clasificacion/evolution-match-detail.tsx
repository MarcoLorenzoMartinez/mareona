import type { MatchdayEvolutionPoint } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getDictionary } from "@/i18n";

interface EvolutionMatchDetailProps {
  readonly point: MatchdayEvolutionPoint;
}

/**
 * Interactive summary card displaying the selected matchday scoreboard, team crests,
 * accumulated points, and league table ranking.
 */
export function EvolutionMatchDetail({ point }: EvolutionMatchDetailProps) {
  const dict = getDictionary();
  const t = dict.season.standings.evolution;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-3.5 sm:flex-row sm:items-center sm:justify-between text-xs">
      {/* Left side: Jornada and minimalist match scoreboard */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="font-semibold text-[var(--foreground-muted)] uppercase tracking-wider text-[11px]">
          {t.matchdayPrefix} {point.matchday}
        </span>

        <span className="text-neutral-300 hidden sm:inline" aria-hidden="true">
          ·
        </span>

        {/* Clean typographic scoreboard without artificial card borders or monospace fonts */}
        <div className="inline-flex items-center gap-2">
          {/* Home team */}
          <div className="flex items-center gap-1.5">
            <TeamCrest
              crestUrl={point.homeCrestUrl}
              teamName={point.homeTeamName}
              size="sm"
              isSporting={point.isHome}
            />
            <span
              className={`text-xs ${
                point.isHome
                  ? "font-bold text-[var(--primary)]"
                  : "font-medium text-[var(--foreground)]"
              }`}
            >
              {point.homeTeamName}
            </span>
          </div>

          {/* Minimalist result: clean athletic typography */}
          <span className="px-1 text-sm font-bold tracking-tight text-[var(--foreground)] tabular-nums">
            {point.homeScore} – {point.awayScore}
          </span>

          {/* Away team */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs ${
                !point.isHome
                  ? "font-bold text-[var(--primary)]"
                  : "font-medium text-[var(--foreground)]"
              }`}
            >
              {point.awayTeamName}
            </span>
            <TeamCrest
              crestUrl={point.awayCrestUrl}
              teamName={point.awayTeamName}
              size="sm"
              isSporting={!point.isHome}
            />
          </div>
        </div>
      </div>

      {/* Right side: Position (primary) and accumulated points (secondary) */}
      <div className="flex items-center gap-4 text-xs text-[var(--foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
          <span className="font-bold text-[var(--foreground)] tabular-nums">
            {point.position}.º
          </span>
          <span className="text-[var(--foreground-muted)]">
            {dict.season.standings.columns.pos}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
          <span
            className="h-1.5 w-1.5 rounded-xs border border-neutral-400 bg-white"
            aria-hidden="true"
          />
          <span className="font-bold text-[var(--foreground)] tabular-nums">
            {point.cumulativePoints}
          </span>
          <span>{dict.season.standings.columns.points}</span>
        </span>
      </div>
    </div>
  );
}
