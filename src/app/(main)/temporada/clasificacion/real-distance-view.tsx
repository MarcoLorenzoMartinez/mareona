import { TeamCrest } from "@/components/media/team-crest";
import {
  getRealDistanceLadder,
  type DomainStandingRow,
  type StandingsViewScope,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface RealDistanceViewProps {
  readonly standings: readonly DomainStandingRow[];
  readonly scopeLabel: string;
  readonly scope?: StandingsViewScope;
  readonly onScopeChange?: (scope: StandingsViewScope) => void;
  readonly scopeOptions?: readonly { readonly id: StandingsViewScope; readonly label: string }[];
}

/**
 * Visualizes the mathematical point gap between teams (Real Distance Ladder).
 * Preserves empty rungs to convey literal point separation between promotion,
 * playoffs, mid-table and relegation zones.
 */
export function RealDistanceView({
  standings,
  scope,
  onScopeChange,
  scopeOptions,
}: RealDistanceViewProps) {
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
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
      <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-[var(--foreground)]">{t.title}</h2>
          <p className="text-xs text-[var(--foreground-muted)]">{t.description}</p>
        </div>

        {/* Filtro de ámbito integrado dentro de la tarjeta */}
        {scopeOptions && onScopeChange && (
          <div
            role="radiogroup"
            aria-label="Filtro de ámbito"
            className="inline-flex self-start rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 sm:self-auto"
          >
            {scopeOptions.map((opt) => {
              const isSelected = scope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onScopeChange(opt.id)}
                  className={`inline-flex min-h-[32px] items-center justify-center rounded-md px-3 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
                    isSelected
                      ? "bg-white text-[var(--foreground)] shadow-xs font-bold"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {ladder.map((rung) => {
          const hasTeams = rung.teams.length > 0;
          const hasSporting = rung.teams.some((t) => t.isSporting);

          return (
            <div
              key={rung.points}
              className={`flex items-center gap-3 py-1 transition-colors ${
                hasSporting ? "bg-red-50/40 rounded-lg px-2 -mx-2" : ""
              }`}
            >
              {/* Casilla de Puntuación */}
              <div
                className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-md border text-sm font-black tabular-nums ${
                  hasSporting
                    ? "border-[var(--primary)] bg-white text-[var(--primary)] shadow-2xs"
                    : hasTeams
                    ? "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-bold"
                    : "border-dashed border-[var(--border)]/70 bg-transparent text-[var(--foreground-muted)] font-medium opacity-60"
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
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-transform hover:-translate-y-0.5 ${
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
                ) : (
                  <div
                    className="h-px w-10 border-b border-dashed border-[var(--border)] opacity-60"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
