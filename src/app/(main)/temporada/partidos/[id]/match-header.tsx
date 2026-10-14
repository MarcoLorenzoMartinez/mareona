import Image from "next/image";
import { TeamCrest } from "@/components/media/team-crest";
import { formatMatchDate, formatMatchTime } from "@/lib/sports-api/dates";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface MatchHeaderProps {
  readonly match: DomainMatchDetail;
}

/**
 * Scoreboard hero card presenting match status, official club crests,
 * result/kickoff time and subtle stadium photography backdrop.
 */
export function MatchHeader({ match }: MatchHeaderProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail;
  const matchT = dict.season.match;
  const kickoffDate = formatMatchDate(
    match.kickoffAt,
    match.isTimeConfirmed,
    false
  );
  const kickoffTime = formatMatchTime(match.kickoffAt);

  const stadiumAsset = getStadiumAsset({
    teamExternalId: match.homeTeam.externalId,
    teamName: match.homeTeam.name,
    isSporting: match.homeTeam.isSporting,
    venueName: match.venue?.name,
  });

  const isFinished =
    match.status === "finished" &&
    match.homeScore !== null &&
    match.awayScore !== null;

  return (
    <section
      aria-label={`${match.homeTeam.name} contra ${match.awayTeam.name}`}
      className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs"
    >
      {stadiumAsset && (
        <div
          className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
          aria-hidden="true"
        >
          <Image
            src={stadiumAsset.imagePath}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover opacity-15"
            priority
          />
        </div>
      )}

      {/* Cabecera superior con competición y estado */}
      <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] pb-3">
        <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
          {match.matchday ? `${matchT.matchday} ${match.matchday} · ` : ""}
          {match.competition}
        </span>
        {match.status === "live" && (
          <span className="rounded-xs bg-[var(--primary)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white animate-pulse">
            {t.status.live}
          </span>
        )}
      </div>

      {/* Marcador principal y equipos */}
      <div className="relative z-10 grid grid-cols-1 items-center gap-6 py-6 md:grid-cols-7">
        {/* Equipo Local */}
        <div className="flex items-center justify-start gap-3.5 md:col-span-3 md:justify-end">
          <span
            className={`text-lg md:text-xl truncate ${
              match.homeTeam.isSporting
                ? "font-bold text-[var(--primary)]"
                : "font-semibold text-[var(--foreground)]"
            }`}
          >
            {match.homeTeam.name}
          </span>
          <TeamCrest
            crestUrl={match.homeTeam.crestUrl}
            teamName={match.homeTeam.name}
            size="lg"
            isSporting={match.homeTeam.isSporting}
          />
        </div>

        {/* Marcador central */}
        <div className="relative flex flex-col items-center justify-center md:col-span-1">
          <span className="text-[11px] font-bold tracking-widest text-[var(--foreground-muted)] uppercase whitespace-nowrap mb-1 md:mb-0 md:absolute md:-top-5 md:left-1/2 md:-translate-x-1/2">
            {kickoffDate}
          </span>
          <div className="flex h-12 min-w-[76px] items-center justify-center rounded-md bg-[var(--surface)]/90 backdrop-blur-xs px-3.5 text-center shadow-2xs border border-[var(--border)]/40">
            <span className="text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums leading-none">
              {isFinished
                ? `${match.homeScore} - ${match.awayScore}`
                : match.isTimeConfirmed
                ? kickoffTime
                : matchT.vs}
            </span>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="flex items-center justify-start gap-3.5 md:col-span-3">
          <TeamCrest
            crestUrl={match.awayTeam.crestUrl}
            teamName={match.awayTeam.name}
            size="lg"
            isSporting={match.awayTeam.isSporting}
          />
          <span
            className={`text-lg md:text-xl truncate ${
              match.awayTeam.isSporting
                ? "font-bold text-[var(--primary)]"
                : "font-semibold text-[var(--foreground)]"
            }`}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>
    </section>
  );
}
