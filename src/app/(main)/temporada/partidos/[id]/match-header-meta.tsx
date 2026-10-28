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
 * Scoreboard footer presenting match venue on the left and official attendance on the right,
 * integrated cleanly into the hero card layout.
 */
export function MatchHeaderMeta({ match, stadiumAsset }: MatchHeaderMetaProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail;

  const venueDisplayName =
    stadiumAsset?.canonicalName ?? match.venue?.name ?? null;
  const venueCity = match.venue?.city ?? null;
  const showCity =
    venueCity &&
    !venueDisplayName?.toLowerCase().includes(venueCity.toLowerCase());
  const formattedAttendance = formatAttendance(match.attendance);

  if (!venueDisplayName && !formattedAttendance) {
    return null;
  }

  return (
    <footer className="relative z-10 mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-t border-[var(--border)] pt-3 text-xs text-[var(--foreground-muted)]">
      {/* Lado izquierdo: Estadio y ciudad */}
      <div className="flex items-center gap-1.5 min-w-0">
        {venueDisplayName && (
          <>
            <span className="font-semibold text-[var(--foreground)] truncate">
              {venueDisplayName}
            </span>
            {showCity && (
              <span className="text-[var(--foreground-muted)] shrink-0">
                · {venueCity}
              </span>
            )}
          </>
        )}
      </div>

      {/* Lado derecho: Asistencia oficial */}
      {formattedAttendance && (
        <div className="flex items-center gap-1 shrink-0 sm:text-right">
          <span className="font-semibold text-[var(--foreground)] tabular-nums">
            {formattedAttendance}
          </span>
          <span>{t.spectators}</span>
        </div>
      )}
    </footer>
  );
}
