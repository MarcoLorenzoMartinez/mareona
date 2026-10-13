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
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3 text-xs shadow-2xs">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-bold text-[var(--foreground)]">
          {t.matchdayPrefix} {point.matchday}
        </span>

        {/* Scoreboard badge with crests for both sides */}
        <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
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
                  ? "font-bold text-[var(--foreground)]"
                  : "text-[var(--foreground-muted)]"
              }`}
            >
              {point.homeTeamName}
            </span>
          </div>

          {/* Result digits */}
          <span className="rounded-xs bg-white px-1.5 py-0.5 font-mono text-xs font-black tabular-nums border border-[var(--border)] text-[var(--foreground)]">
            {point.homeScore} - {point.awayScore}
          </span>

          {/* Away team */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs ${
                !point.isHome
                  ? "font-bold text-[var(--foreground)]"
                  : "text-[var(--foreground-muted)]"
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

      {/* Accumulated points and ranking stats */}
      <div className="flex items-center gap-5 text-[var(--foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
          <strong>{point.cumulativePoints}</strong> {dict.season.standings.columns.points}
        </span>
        <span className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
          <span
            className="h-1.5 w-1.5 rounded-xs border border-neutral-400 bg-white"
            aria-hidden="true"
          />
          <strong className="text-[var(--foreground)]">{point.position}.ª</strong>{" "}
          {dict.season.standings.columns.pos}
        </span>
      </div>
    </div>
  );
}
