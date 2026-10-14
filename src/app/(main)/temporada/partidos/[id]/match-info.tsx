import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface MatchInfoProps {
  readonly match: DomainMatchDetail;
}

function formatAttendance(attendance: number | null): string | null {
  if (attendance === null || attendance <= 0) {
    return null;
  }
  return new Intl.NumberFormat("es-ES").format(attendance);
}

/**
 * Key match metadata panel detailing venue/stadium, official spectator attendance,
 * and competition round specifications.
 */
export function MatchInfo({ match }: MatchInfoProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail;

  const stadiumAsset = getStadiumAsset({
    teamExternalId: match.homeTeam.externalId,
    teamName: match.homeTeam.name,
    isSporting: match.homeTeam.isSporting,
    venueName: match.venue?.name,
  });

  const formattedAttendance = formatAttendance(match.attendance);
  const venueDisplayName =
    stadiumAsset?.canonicalName ?? match.venue?.name ?? t.notAvailable;

  return (
    <section
      aria-label={t.title}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {/* Campo en el que se disputó */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <h2 className="text-xs font-semibold tracking-wider text-[var(--foreground-muted)] uppercase">
          {t.stadium}
        </h2>
        <p className="mt-2 text-base font-bold text-[var(--foreground)]">
          {venueDisplayName}
        </p>
        {match.venue?.city && (
          <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
            {match.venue.city}
          </p>
        )}
      </div>

      {/* Asistencia de aficionados */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <h2 className="text-xs font-semibold tracking-wider text-[var(--foreground-muted)] uppercase">
          {t.attendance}
        </h2>
        {formattedAttendance ? (
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums">
              {formattedAttendance}
            </span>
            <span className="text-xs font-medium text-[var(--foreground-muted)]">
              {t.spectators}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm font-medium text-[var(--foreground-muted)]">
            {match.status === "scheduled" ? t.pendingMatch : t.notAvailable}
          </p>
        )}
      </div>
    </section>
  );
}
