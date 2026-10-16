import { TeamCrest } from "@/components/media/team-crest";
import type { DomainStandingRow, StandingsViewScope } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface StandingsRowProps {
  readonly row: DomainStandingRow;
  readonly scope: StandingsViewScope;
  readonly totalTeams: number;
}

/**
 * Single team row inside the full league table, displaying ranking badge,
 * team crest, form stats, goal difference, and points.
 */
export function StandingsRow({ row, scope, totalTeams }: StandingsRowProps) {
  const dict = getDictionary();
  const t = dict.season.standings;

  const isDirectPromotion = scope === "total" && row.position <= 2;
  const isPlayoff = scope === "total" && row.position >= 3 && row.position <= 6;
  const isRelegation =
    scope === "total" && totalTeams > 4 ? row.position > totalTeams - 4 : false;
  const goalDiff = row.goalsFor - row.goalsAgainst;
  const barClass = isDirectPromotion
    ? "bg-[#16a34a]"
    : isPlayoff
      ? "bg-[#2563eb]"
      : isRelegation
        ? "bg-[#dc2626]"
        : "";

  return (
    <tr
      className={`transition-colors text-sm ${
        row.isSporting
          ? "bg-red-50/70 font-semibold text-[var(--foreground)]"
          : "hover:bg-[var(--surface)] text-[var(--foreground)]"
      }`}
    >
      <td
        className="relative py-2.5 pl-3 pr-2 text-center"
        aria-label={`Posición ${row.position}${
          isDirectPromotion
            ? `, ${t.zones.promotion}`
            : isPlayoff
              ? `, ${t.zones.playoff}`
              : isRelegation
                ? `, ${t.zones.relegation}`
                : ""
        }`}
      >
        {barClass && (
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full ${barClass}`}
            aria-hidden="true"
          />
        )}
        <span className="text-xs font-bold text-neutral-800 tabular-nums">
          {row.position}
        </span>
      </td>

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

      <td className="py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.played}
      </td>
      <td className="hidden sm:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.won}
      </td>
      <td className="hidden sm:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.drawn}
      </td>
      <td className="hidden sm:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.lost}
      </td>
      <td className="hidden md:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.goalsFor}
      </td>
      <td className="hidden md:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.goalsAgainst}
      </td>

      <td className="py-2.5 text-center tabular-nums text-xs sm:text-sm font-medium">
        <span
          className={
            goalDiff > 0
              ? "text-emerald-700 font-semibold"
              : goalDiff < 0
              ? "text-red-700"
              : "text-[var(--foreground-muted)]"
          }
        >
          {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
        </span>
      </td>

      <td className="py-2.5 pr-3 text-right font-black tabular-nums text-[var(--foreground)]">
        {row.points}
      </td>
    </tr>
  );
}
