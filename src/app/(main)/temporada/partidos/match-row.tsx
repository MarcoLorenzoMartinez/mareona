import Link from "next/link";
import { formatMatchDate, formatMatchTime } from "@/lib/sports-api/dates";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getDictionary } from "@/i18n";

interface MatchRowProps {
  readonly match: DomainMatchSummary;
  readonly isNext: boolean;
}

/**
 * Individual match card in the schedule list with matchday, kickoff,
 * team crests, score, and venue. Navigates to match detail view on click.
 */
export function MatchRow({ match, isNext }: MatchRowProps) {
  const dict = getDictionary();
  const t = dict.season.matchesList;
  const matchT = dict.season.match;

  const isFinished =
    match.status === "finished" &&
    match.homeScore !== null &&
    match.awayScore !== null;
  const isConfirmedTime = match.isTimeConfirmed === true;
  const dateLabel = formatMatchDate(match.kickoffAt, isConfirmedTime);
  const timeLabel = formatMatchTime(match.kickoffAt);

  return (
    <li className="group">
      <Link
        href={`/temporada/partidos/${match.externalId}`}
        aria-label={`${matchT.matchday} ${match.matchday ?? "—"}: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
        className={`block p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
          isNext
            ? "bg-red-50/50 border-l-4 border-l-[var(--primary)] hover:bg-red-50"
            : "hover:bg-[var(--surface)]"
        }`}
      >
      <div className="mb-2.5 flex items-center justify-between text-xs text-[var(--foreground-muted)]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--foreground)]">
            {matchT.matchday} {match.matchday ?? "—"}
          </span>
          <span>·</span>
          <span className="capitalize">{dateLabel}</span>
          {isNext && (
            <span className="rounded-xs bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {t.nextBadge}
            </span>
          )}
        </div>
        {match.venue && (
          <span className="hidden sm:inline-block truncate max-w-[220px] text-[11px]">
            {match.venue}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-7 sm:gap-4">
        {/* Equipo Local */}
        <div className="flex items-center justify-start gap-2.5 sm:col-span-3 sm:justify-end">
          <span
            className={`text-sm truncate ${
              match.homeTeam.isSporting
                ? "font-bold text-[var(--primary)]"
                : "font-medium text-[var(--foreground)]"
            }`}
          >
            {match.homeTeam.name}
          </span>
          <TeamCrest
            crestUrl={match.homeTeam.crestUrl}
            teamName={match.homeTeam.name}
            size="sm"
            isSporting={match.homeTeam.isSporting}
          />
        </div>

        {/* Marcador / Horario */}
        <div className="flex items-center justify-center sm:col-span-1">
          {isFinished ? (
            <span className="inline-flex items-center justify-center rounded-sm bg-neutral-100 px-2.5 py-1 text-sm font-bold tabular-nums text-[var(--foreground)]">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : isConfirmedTime ? (
            <span className="inline-flex items-center justify-center rounded-sm bg-[var(--surface)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--foreground)] border border-[var(--border)]">
              {timeLabel}
            </span>
          ) : (
            <span className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
              {matchT.vs}
            </span>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="flex items-center justify-start gap-2.5 sm:col-span-3">
          <TeamCrest
            crestUrl={match.awayTeam.crestUrl}
            teamName={match.awayTeam.name}
            size="sm"
            isSporting={match.awayTeam.isSporting}
          />
          <span
            className={`text-sm truncate ${
              match.awayTeam.isSporting
                ? "font-bold text-[var(--primary)]"
                : "font-medium text-[var(--foreground)]"
            }`}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>
      </Link>
    </li>
  );
}
