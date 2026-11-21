import { TeamCrest } from "@/components/media/team-crest";
import type { StandingZone } from "@/lib/sports-api/standings-window";
import type { DomainStandingRow } from "@/lib/sports-api/types";

export const ZONE_BAR_CLASS: Readonly<Record<StandingZone, string>> = {
  promotion: "bg-[#16a34a]",
  playoff: "bg-[#d97706]",
  relegation: "bg-[#dc2626]",
  none: "",
};

interface SummaryStandingRowProps {
  readonly row: DomainStandingRow;
  readonly zone: StandingZone;
  readonly zoneLabel: string;
}

/**
 * Single row of the compact standings table. Zone is announced to assistive
 * technology through the position cell, never by the accent bar alone.
 */
export function SummaryStandingRow({ row, zone, zoneLabel }: SummaryStandingRowProps) {
  const barClass = ZONE_BAR_CLASS[zone];

  return (
    <tr
      aria-current={row.isSporting ? "true" : undefined}
      className={`text-sm transition-colors ${
        row.isSporting
          ? "bg-red-50/70 font-semibold"
          : "hover:bg-[var(--surface)]"
      }`}
    >
      <td
        className="relative py-2.5 pl-3 pr-2 text-center"
        aria-label={`Posición ${row.position}${zoneLabel ? `, ${zoneLabel}` : ""}`}
      >
        {barClass && (
          <span
            className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full ${barClass}`}
            aria-hidden="true"
          />
        )}
        <span className="text-xs font-bold tabular-nums text-neutral-800">{row.position}</span>
      </td>
      <td className="min-w-0 py-2.5 pl-1.5 pr-2 sm:pl-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <TeamCrest
            crestUrl={row.crestUrl}
            teamName={row.teamName}
            size="sm"
            isSporting={row.isSporting}
          />
          <span
            className={`truncate ${row.isSporting ? "font-bold text-[var(--primary)]" : "font-medium"}`}
          >
            {row.teamName}
          </span>
        </div>
      </td>
      <td className="py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
        {row.played}
      </td>
      <td className="py-2.5 pr-3 text-right font-black tabular-nums text-[var(--foreground)]">
        {row.points}
      </td>
    </tr>
  );
}
