import { TeamCrest } from "@/components/media/team-crest";
import {
  getRealDistanceLadder,
  type DomainStandingRow,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface RealDistanceViewProps {
  readonly standings: readonly DomainStandingRow[];
}

/**
 * Visualizes the mathematical point gap between teams (Real Distance Ladder).
 * Preserves empty rungs to convey literal point separation between promotion,
 * playoffs, mid-table and relegation zones.
 * Each point level is clearly delimited with subtle dividers to avoid confusion
 * when multiple teams share the same score.
 */
export function RealDistanceView({ standings }: RealDistanceViewProps) {
  const dict = getDictionary();
  const t = dict.season.standings.distanceReal;
  const ladder = getRealDistanceLadder(standings);

  if (ladder.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm text-[var(--foreground-muted)]">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-2xs sm:p-6">
      <div className="flex flex-col divide-y divide-neutral-100">
        {ladder.map((rung) => {
          const hasTeams = rung.teams.length > 0;

          return (
            <div
              key={rung.points}
              className={`flex items-start sm:items-center gap-3 py-2.5 transition-colors ${
                hasTeams ? "hover:bg-neutral-50/50" : "opacity-75"
              }`}
            >
              {/* Casilla de Puntuación (anclada arriba si hay múltiples equipos apilados) */}
              <div
                className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border text-sm tabular-nums select-none ${
                  hasTeams
                    ? "border-neutral-200 bg-[var(--surface)] text-[var(--foreground)] font-bold shadow-2xs"
                    : "border-dashed border-neutral-200/80 bg-neutral-50/30 text-[var(--foreground-muted)] font-medium"
                }`}
                title={`${rung.points} ${t.pointsLabel}`}
                aria-label={`${rung.points} ${t.pointsLabel}: ${
                  hasTeams
                    ? rung.teams.map((t) => t.teamName).join(", ")
                    : t.noTeams
                }`}
              >
                {rung.points}
              </div>

              {/* Lista horizontal de equipos con esta puntuación */}
              <div className="flex flex-1 flex-wrap items-center gap-2 min-h-[36px]">
                {hasTeams ? (
                  rung.teams.map((team) => (
                    <div
                      key={team.teamExternalId}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] ${
                        team.isSporting
                          ? "border-[var(--primary)] bg-white text-[var(--primary)] font-bold ring-2 ring-red-100"
                          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      <TeamCrest
                        crestUrl={team.crestUrl}
                        teamName={team.teamName}
                        size="sm"
                        isSporting={team.isSporting}
                      />
                      <span className="truncate max-w-[140px] sm:max-w-none">
                        {team.teamName}
                      </span>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
