import type { DomainMatchDetail } from "@/lib/sports-api/types";
import type { StadiumAsset } from "@/lib/sports-api/stadiums";
import { getDictionary } from "@/i18n";

interface MatchHeaderMetaProps {
  readonly match: DomainMatchDetail;
  readonly stadiumAsset: StadiumAsset | null;
}

function formatAttendance(attendance: number | null): string | null {
  if (attendance === null || attendance <= 0) {
    return null;
  }
  return new Intl.NumberFormat("es-ES").format(attendance);
}

/**
 * Scoreboard footer presenting match venue, city, and official attendance
 * centered cleanly at the bottom of the hero card.
 */
export function MatchHeaderMeta({ match, stadiumAsset }: MatchHeaderMetaProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail;

  const venueDisplayName =
    stadiumAsset?.canonicalName ?? match.venue?.name ?? null;
  const venueCity = match.venue?.city ?? null;
  const formattedAttendance = formatAttendance(match.attendance);

  if (!venueDisplayName && !formattedAttendance) {
    return null;
  }

  return (
    <footer className="relative z-10 mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[var(--foreground-muted)]">
      {venueDisplayName && (
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="font-semibold text-[var(--foreground)]">
            {venueDisplayName}
          </span>
          {venueCity && <span>({venueCity})</span>}
        </span>
      )}

      {venueDisplayName && formattedAttendance && (
        <span aria-hidden="true" className="text-neutral-300">
          ·
        </span>
      )}

      {formattedAttendance && (
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold text-[var(--foreground)] tabular-nums">
            {formattedAttendance}
          </span>
          <span>{t.spectators}</span>
        </span>
      )}
    </footer>
  );
}
