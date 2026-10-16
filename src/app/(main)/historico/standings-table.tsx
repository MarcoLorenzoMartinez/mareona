import { TeamCrest } from "@/components/media/team-crest";
import type { HistoricalStandingRow, HistoricalSeason } from "@/lib/historical/types";
import {
  resolveHistoricalZone,
  getZoneBadgeStyle,
  getZoneLegendItems,
} from "@/lib/historical/standings-zones";

interface StandingsTableProps {
  readonly rows: readonly HistoricalStandingRow[];
  readonly season: HistoricalSeason;
}

/**
 * Renders the official league standings table for a historical campaign.
 * Employs <TeamCrest> for club heraldry, tabular numbers, and distinctive highlighting for Real Sporting.
 */
export function HistoricalStandingsTable({ rows, season }: StandingsTableProps) {
  const isSingleRow = rows.length === 1 && rows[0]?.isSporting;
  const legendItems = getZoneLegendItems(season);

  return (
    <section aria-label={`Clasificación oficial de la temporada ${season.label}`} className="w-full">
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Clasificación Oficial
            </h3>
            <span className="text-xs text-[var(--foreground-muted)]">
              {season.tierName} — Temporada {season.label}
            </span>
          </div>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold text-neutral-700">
            {season.pointsSystem} pts por victoria
          </span>
        </div>

        {isSingleRow && (
          <div className="mb-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--foreground-muted)]">
            Registro individual consolidado del Real Sporting en esta edición oficial.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Clasificación de {season.tierName} temporada {season.label}
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
                <th scope="col" className="w-10 sm:w-12 py-2.5 pl-3 text-center">Pos</th>
                <th scope="col" className="py-2.5 pl-2 pr-2 text-left">Equipo</th>
                <th scope="col" className="w-14 sm:w-16 py-2.5 text-right font-black">Pts</th>
                <th scope="col" className="w-10 sm:w-12 py-2.5 text-center">PJ</th>
                <th scope="col" className="w-10 sm:w-12 py-2.5 text-center hidden sm:table-cell">PG</th>
                <th scope="col" className="w-10 sm:w-12 py-2.5 text-center hidden sm:table-cell">PE</th>
                <th scope="col" className="w-10 sm:w-12 py-2.5 text-center hidden sm:table-cell">PP</th>
                <th scope="col" className="w-12 sm:w-14 py-2.5 text-center hidden md:table-cell">GF</th>
                <th scope="col" className="w-12 sm:w-14 py-2.5 text-center hidden md:table-cell">GC</th>
                <th scope="col" className="w-12 sm:w-14 py-2.5 pr-3 text-right">DG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row) => {
                const goalDiff = row.goalsFor - row.goalsAgainst;
                const isPositive = goalDiff > 0;
                const zone = resolveHistoricalZone(season, row.position, rows.length, row.zone);
                const badgeStyle = getZoneBadgeStyle(zone);

                return (
                  <tr
                    key={`${row.teamSlug}-${row.position}`}
                    className={`transition-colors text-sm ${
                      row.isSporting
                        ? "bg-red-50/80 font-bold text-[var(--foreground)]"
                        : "hover:bg-[var(--surface)] text-[var(--foreground)]"
                    }`}
                  >
                    {/* Posición con indicador de zona */}
                    <td className="py-2.5 pl-3 text-center">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold tabular-nums ${badgeStyle.badgeClass}`}
                        aria-label={`Posición ${row.position}, ${badgeStyle.label}`}
                      >
                        {row.position}
                      </span>
                    </td>

                    {/* Escudo y Nombre del Equipo */}
                    <td className="py-2.5 pl-2 pr-2 text-left">
                      <div className="flex items-center gap-2">
                        <TeamCrest
                          crestUrl={row.crestUrl}
                          teamName={row.teamName}
                          size="sm"
                          isSporting={row.isSporting}
                        />
                        <span
                          className={`truncate max-w-[160px] sm:max-w-[240px] ${
                            row.isSporting ? "font-bold text-[var(--primary)]" : ""
                          }`}
                        >
                          {row.teamName}
                        </span>
                      </div>
                    </td>

                    {/* Puntos */}
                    <td className="py-2.5 text-right font-black tabular-nums text-[var(--foreground)]">
                      {row.points}
                    </td>

                    {/* PJ */}
                    <td className="py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                      {row.played}
                    </td>

                    {/* PG */}
                    <td className="py-2.5 text-center tabular-nums text-neutral-600 hidden sm:table-cell">
                      {row.won}
                    </td>

                    {/* PE */}
                    <td className="py-2.5 text-center tabular-nums text-neutral-600 hidden sm:table-cell">
                      {row.drawn}
                    </td>

                    {/* PP */}
                    <td className="py-2.5 text-center tabular-nums text-neutral-600 hidden sm:table-cell">
                      {row.lost}
                    </td>

                    {/* GF */}
                    <td className="py-2.5 text-center tabular-nums text-neutral-600 hidden md:table-cell">
                      {row.goalsFor}
                    </td>

                    {/* GC */}
                    <td className="py-2.5 text-center tabular-nums text-neutral-600 hidden md:table-cell">
                      {row.goalsAgainst}
                    </td>

                    {/* DG */}
                    <td
                      className={`py-2.5 pr-3 text-right tabular-nums text-xs font-semibold ${
                        isPositive ? "text-emerald-700" : goalDiff < 0 ? "text-rose-700" : "text-neutral-500"
                      }`}
                    >
                      {isPositive ? `+${goalDiff}` : goalDiff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {legendItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
            {legendItems.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-xs ${item.dotClass}`} aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
