import Link from "next/link";
import { selectStandingsWindow, resolveStandingZone } from "@/lib/sports-api/standings-window";
import type { DomainStandingRow } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { SummaryStandingRow, ZONE_BAR_CLASS } from "./summary-standing-row";

interface SeasonSummaryTableProps {
  readonly standings: readonly DomainStandingRow[];
  readonly seasonLabel: string;
}

/**
 * Compact standings card for the home page: a contiguous slice of the table
 * centred on Real Sporting, linking to the full table.
 */
export function SeasonSummaryTable({ standings, seasonLabel }: SeasonSummaryTableProps) {
  const dict = getDictionary();
  const zoneLabels = {
    promotion: dict.season.standings.zones.promotion,
    playoff: dict.season.standings.zones.playoff,
    relegation: dict.season.standings.zones.relegation,
    none: "",
  } as const;
  const rows = selectStandingsWindow(standings);
  const visibleZones = new Set(
    rows.map((row) => resolveStandingZone(row.position, standings.length))
  );
  const legendZones = (["promotion", "playoff", "relegation"] as const).filter((zone) =>
    visibleZones.has(zone)
  );

  return (
    <section aria-label="Clasificación" className="h-full w-full">
      <div className="h-full rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-3">
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
            className="rounded-xs text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)]"
          >
            {dict.common.viewAll} &rarr;
          </Link>
        </div>

        {rows.length > 0 ? (
          <>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                {dict.season.standings.title} de {dict.season.competitionName} {seasonLabel}
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase text-[var(--foreground-muted)]">
                  <th scope="col" className="w-10 py-2 pl-3 text-center sm:w-12">
                    {dict.season.standings.columns.pos}
                  </th>
                  <th scope="col" className="py-2 pl-1.5 pr-2 text-left sm:pl-2">
                    {dict.season.standings.columns.team}
                  </th>
                  <th
                    scope="col"
                    className="w-12 py-2 text-center sm:w-16"
                    title={dict.season.standings.columnTitles.played}
                  >
                    {dict.season.standings.columns.played}
                  </th>
                  <th
                    scope="col"
                    className="w-12 py-2 pr-3 text-right sm:w-16"
                    title={dict.season.standings.columnTitles.points}
                  >
                    {dict.season.standings.columns.points}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((row) => {
                  const zone = resolveStandingZone(row.position, standings.length);
                  return (
                    <SummaryStandingRow
                      key={row.teamExternalId}
                      row={row}
                      zone={zone}
                      zoneLabel={zoneLabels[zone]}
                    />
                  );
                })}
              </tbody>
            </table>
            {legendZones.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
                {legendZones.map((zone) => (
                  <li key={zone} className="flex items-center gap-1.5">
                    <span
                      className={`h-3 w-[3px] rounded-full ${ZONE_BAR_CLASS[zone]}`}
                      aria-hidden="true"
                    />
                    {zoneLabels[zone]}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--foreground-muted)]">
            {dict.season.standings.noData}
          </p>
        )}
      </div>
    </section>
  );
}
