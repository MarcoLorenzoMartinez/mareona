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
  const isLive = match.status === "live";
  const hasScore = isFinished || isLive;
  const isConfirmedTime = match.isTimeConfirmed === true;
  const dateLabel = formatMatchDate(match.kickoffAt, isConfirmedTime);
  const timeLabel = formatMatchTime(match.kickoffAt);

  return (
    <li className="group">
      <Link
        href={`/temporada/partidos/${match.externalId}`}
        aria-label={
          match.competition === "Copa del Rey"
            ? `Copa del Rey: ${match.homeTeam.name} vs ${match.awayTeam.name}`
            : `${matchT.matchday} ${match.matchday ?? "—"}: ${match.homeTeam.name} vs ${match.awayTeam.name}`
        }
        className={`block p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
          isNext
            ? "bg-red-50/50 border-l-4 border-l-[var(--primary)] hover:bg-red-50"
            : "hover:bg-[var(--surface)]"
        }`}
      >
      <div className="mb-2.5 flex items-center justify-between text-xs text-[var(--foreground-muted)]">
        <div className="flex items-center gap-2">
          {match.competition === "Copa del Rey" ? (
            <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
              {match.roundName ? `${match.roundName} · ` : ""}Copa del Rey
            </span>
          ) : (
            <span className="font-bold text-[var(--foreground)]">
              {matchT.matchday} {match.matchday ?? "—"}
            </span>
          )}
          <span>·</span>
          <span className="capitalize">{dateLabel}</span>
          {isLive ? (
            <span className="rounded-xs bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
              {dict.season.matchDetail.status.live}
            </span>
          ) : isNext ? (
            <span className="rounded-xs bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {t.nextBadge}
            </span>
          ) : null}
        </div>
        {match.venue && (
          <span className="hidden sm:inline-block truncate max-w-[220px] text-[11px]">
            {match.venue}
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 items-center gap-1.5 sm:gap-4">
        {/* Equipo Local */}
        <div className="col-span-3 flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-0 text-right">
          <span
            className={`text-xs sm:text-sm truncate ${
              match.homeTeam.isSporting
                ? "font-bold text-[var(--primary)]"
                : "font-medium text-[var(--foreground)]"
            }`}
          >
            {match.homeTeam.name}
          </span>
          <div className="shrink-0">
            <TeamCrest
              crestUrl={match.homeTeam.crestUrl}
              teamName={match.homeTeam.name}
              size="sm"
              isSporting={match.homeTeam.isSporting}
            />
          </div>
        </div>

        {/* Marcador / Horario */}
        <div className="col-span-1 flex items-center justify-center shrink-0">
          {hasScore ? (
            <span
              className={`inline-flex items-center justify-center rounded-sm px-2 py-0.5 text-xs font-bold tabular-nums sm:px-2.5 sm:py-1 sm:text-sm ${
                isLive
                  ? "bg-red-50 text-[var(--primary)] border border-red-200"
                  : "bg-neutral-100 text-[var(--foreground)]"
              }`}
            >
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </span>
          ) : isConfirmedTime ? (
            <span className="inline-flex items-center justify-center rounded-sm bg-[var(--surface)] px-2 py-0.5 text-xs font-bold tabular-nums text-[var(--foreground)] border border-[var(--border)] sm:px-2.5 sm:py-1">
              {timeLabel}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider sm:text-xs">
              {matchT.vs}
            </span>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="col-span-3 flex items-center justify-start gap-1.5 sm:gap-2.5 min-w-0 text-left">
          <div className="shrink-0">
            <TeamCrest
              crestUrl={match.awayTeam.crestUrl}
              teamName={match.awayTeam.name}
              size="sm"
              isSporting={match.awayTeam.isSporting}
            />
          </div>
          <span
            className={`text-xs sm:text-sm truncate ${
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
