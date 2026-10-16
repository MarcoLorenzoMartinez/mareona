import Link from "next/link";
import { TeamCrest } from "@/components/media/team-crest";
import type { DomainStandingRow } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface SeasonSummaryTableProps {
  readonly standings: readonly DomainStandingRow[];
  readonly seasonLabel: string;
}

/**
 * Compact 4-column overview standings table displayed on the season hub page,
 * highlighting Real Sporting and linking to the comprehensive standings view.
 */
export function SeasonSummaryTable({
  standings,
  seasonLabel,
}: SeasonSummaryTableProps) {
  const dict = getDictionary();

  return (
    <section aria-label="Clasificación" className="w-full">
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              {dict.season.standings.title}
            </h2>
            <span className="text-xs text-[var(--foreground-muted)]">
              {dict.season.competitionName} {seasonLabel}
            </span>
          </div>
          <Link
            href="/temporada/clasificacion"
            className="text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-xs"
          >
            {dict.common.viewAll} &rarr;
          </Link>
        </div>

        {standings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  {dict.season.standings.title} de {dict.season.competitionName} {seasonLabel}
                </caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
                    <th scope="col" className="w-10 sm:w-12 py-2.5 pl-3 text-center">
                      {dict.season.standings.columns.pos}
                    </th>
                    <th scope="col" className="py-2.5 pl-1.5 sm:pl-2 pr-2 text-left">
                      {dict.season.standings.columns.team}
                    </th>
                    <th
                      scope="col"
                      className="w-14 sm:w-16 py-2.5 text-center"
                      title={dict.season.standings.columnTitles.played}
                    >
                      {dict.season.standings.columns.played}
                    </th>
                    <th
                      scope="col"
                      className="w-14 sm:w-16 py-2.5 pr-3 text-right"
                      title={dict.season.standings.columnTitles.points}
                    >
                      {dict.season.standings.columns.points}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {standings.map((row) => {
                    const isDirectPromotion = row.position <= 2;
                    const isPlayoff = row.position >= 3 && row.position <= 6;
                    const isRelegation =
                      standings.length > 4 ? row.position > standings.length - 4 : false;

                    return (
                      <tr
                        key={row.teamExternalId}
                        className={`transition-colors text-sm ${
                          row.isSporting
                            ? "bg-red-50/70 font-semibold text-[var(--foreground)]"
                            : "hover:bg-[var(--surface)] text-[var(--foreground)]"
                        }`}
                      >
                        {/* Posición */}
                        <td className="py-2.5 pl-3 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold ${
                              isDirectPromotion
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : isPlayoff
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
                                  : isRelegation
                                    ? "bg-rose-700 text-white shadow-2xs"
                                    : "text-[var(--foreground-muted)]"
                            }`}
                            aria-label={`Posición ${row.position}${
                              isDirectPromotion
                                ? ", Ascenso directo"
                                : isPlayoff
                                  ? ", Playoff de ascenso"
                                  : isRelegation
                                    ? ", Descenso"
                                    : ""
                            }`}
                          >
                            {row.position}
                          </span>
                        </td>

                        {/* Equipo */}
                        <td className="py-2.5 pl-1.5 sm:pl-2 pr-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <TeamCrest
                              crestUrl={row.crestUrl}
                              teamName={row.teamName}
                              size="sm"
                              isSporting={row.isSporting}
                            />
                            <span
                              className={`truncate ${
                                row.isSporting ? "font-bold text-[var(--primary)]" : "font-medium"
                              }`}
                            >
                              {row.teamName}
                            </span>
                          </div>
                        </td>

                        {/* PJ */}
                        <td className="py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                          {row.played}
                        </td>

                        {/* Pts */}
                        <td className="py-2.5 pr-3 text-right font-black tabular-nums text-[var(--foreground)]">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-emerald-600" aria-hidden="true" />
                  {dict.season.standings.zones.promotion}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-emerald-100 border border-emerald-400" aria-hidden="true" />
                  {dict.season.standings.zones.playoff}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-rose-700" aria-hidden="true" />
                  {dict.season.standings.zones.relegation}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-[var(--foreground-muted)]">
              {dict.season.standings.noData}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
