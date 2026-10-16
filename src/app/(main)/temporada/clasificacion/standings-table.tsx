import type { DomainStandingRow, StandingsViewScope } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { StandingsRow } from "./standings-row";

interface StandingsTableProps {
  readonly standings: readonly DomainStandingRow[];
  readonly scope: StandingsViewScope;
  readonly seasonLabel: string;
  readonly activeScopeLabel: string;
}

/**
 * Responsive 9-column league standings table with Sporting highlight,
 * goal difference semantics, and promotion/playoff/relegation legend.
 */
export function StandingsTable({
  standings,
  scope,
  seasonLabel,
  activeScopeLabel,
}: StandingsTableProps) {
  const dict = getDictionary();
  const t = dict.season.standings;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-5">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            {t.title} {seasonLabel} ({activeScopeLabel})
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
              <th scope="col" className="w-10 sm:w-12 py-2.5 pl-3 text-center">
                {t.columns.pos}
              </th>
              <th scope="col" className="py-2.5 pl-1.5 sm:pl-2 pr-2 text-left">
                {t.columns.team}
              </th>
              <th scope="col" className="w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.played}>
                {t.columns.played}
              </th>
              <th scope="col" className="hidden sm:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.won}>
                {t.columns.won}
              </th>
              <th scope="col" className="hidden sm:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.drawn}>
                {t.columns.drawn}
              </th>
              <th scope="col" className="hidden sm:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.lost}>
                {t.columns.lost}
              </th>
              <th scope="col" className="hidden md:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.goalsFor}>
                {t.columns.goalsFor}
              </th>
              <th scope="col" className="hidden md:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.goalsAgainst}>
                {t.columns.goalsAgainst}
              </th>
              <th scope="col" className="w-12 sm:w-14 py-2.5 text-center" title={t.columnTitles.goalDifference}>
                {t.columns.goalDifference}
              </th>
              <th scope="col" className="w-12 sm:w-14 py-2.5 pr-3 text-right" title={t.columnTitles.points}>
                {t.columns.points}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {standings.map((row) => (
              <StandingsRow
                key={row.teamExternalId}
                row={row}
                scope={scope}
                totalTeams={standings.length}
              />
            ))}
          </tbody>
        </table>
      </div>

      {scope === "total" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-[3px] rounded-full bg-[#16a34a]" aria-hidden="true" />
              {t.zones.promotion}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-[3px] rounded-full bg-[#2563eb]" aria-hidden="true" />
              {t.zones.playoff}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-[3px] rounded-full bg-[#dc2626]" aria-hidden="true" />
              {t.zones.relegation}
            </span>
          </div>
          <span>{t.subtitle}</span>
        </div>
      )}
    </div>
  );
}
