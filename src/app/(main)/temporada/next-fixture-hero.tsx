import Image from "next/image";
import Link from "next/link";
import { formatMatchDate, formatMatchTime } from "@/lib/sports-api/dates";
import { TeamCrest } from "@/components/media/team-crest";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface NextFixtureHeroProps {
  readonly match: DomainMatchSummary | null;
}

/**
 * Hero card spotlighting Real Sporting's upcoming or latest match,
 * including stadium photography, official crests, kickoff time, and venue.
 */
export function NextFixtureHero({ match }: NextFixtureHeroProps) {
  const dict = getDictionary();
  const matchKickoff = match
    ? {
        date: formatMatchDate(
          match.kickoffAt,
          match.isTimeConfirmed ?? true,
          false
        ),
        time: formatMatchTime(match.kickoffAt),
      }
    : null;
  const stadiumAsset = match
    ? getStadiumAsset({
        teamExternalId: match.homeTeam.externalId,
        teamName: match.homeTeam.name,
        isSporting: match.homeTeam.isSporting,
        venueName: match.venue,
      })
    : null;

  return (
    <section aria-label="Partido del Real Sporting" className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs">
        {stadiumAsset && (
          <div
            className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
            aria-hidden="true"
          >
            <Image
              src={stadiumAsset.imagePath}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover opacity-10"
              priority
            />
          </div>
        )}

        <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] pb-3">
          <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
            {match
              ? `${dict.season.match.matchday} ${match.matchday ?? "—"} · ${dict.season.competitionName}`
              : dict.season.match.nextFixture}
          </span>
          {match && (
            <Link
              href={`/temporada/partidos/${match.externalId}`}
              className="text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-xs"
            >
              {dict.season.matchDetail.title} →
            </Link>
          )}
        </div>

        {match && matchKickoff ? (
          <div className="relative z-10">
            <div className="grid grid-cols-7 items-center gap-2 py-4 md:gap-6 md:py-6">
              {/* Equipo Local */}
              <div className="col-span-3 flex flex-col md:flex-row items-center justify-center md:justify-end gap-1.5 md:gap-3.5 text-center md:text-right min-w-0">
                <span className="order-2 md:order-1 text-xs sm:text-sm font-bold text-[var(--foreground)] md:text-xl truncate max-w-full">
                  {match.homeTeam.name}
                </span>
                <div className="order-1 md:order-2 shrink-0 md:hidden">
                  <TeamCrest
                    crestUrl={match.homeTeam.crestUrl}
                    teamName={match.homeTeam.name}
                    size="md"
                    isSporting={match.homeTeam.isSporting}
                  />
                </div>
                <div className="order-1 md:order-2 shrink-0 hidden md:block">
                  <TeamCrest
                    crestUrl={match.homeTeam.crestUrl}
                    teamName={match.homeTeam.name}
                    size="lg"
                    isSporting={match.homeTeam.isSporting}
                  />
                </div>
              </div>

              {/* Marcador / Horario */}
              <div className="col-span-1 relative flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[var(--foreground-muted)] uppercase whitespace-nowrap mb-1 md:mb-0 md:absolute md:-top-5 md:left-1/2 md:-translate-x-1/2">
                  {matchKickoff.date}
                </span>
                <div className="flex h-10 md:h-12 min-w-[64px] md:min-w-[76px] items-center justify-center rounded-md bg-[var(--surface)]/90 backdrop-blur-xs px-2.5 md:px-3.5 text-center shadow-2xs border border-[var(--border)]/40">
                  <span className="text-xl md:text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums leading-none">
                    {match.status === "finished" &&
                    match.homeScore !== null &&
                    match.awayScore !== null
                      ? `${match.homeScore} - ${match.awayScore}`
                      : match.isTimeConfirmed === false
                      ? dict.season.match.vs
                      : matchKickoff.time}
                  </span>
                </div>
              </div>

              {/* Equipo Visitante */}
              <div className="col-span-3 flex flex-col md:flex-row items-center justify-center md:justify-start gap-1.5 md:gap-3.5 text-center md:text-left min-w-0">
                <div className="shrink-0 md:hidden">
                  <TeamCrest
                    crestUrl={match.awayTeam.crestUrl}
                    teamName={match.awayTeam.name}
                    size="md"
                    isSporting={match.awayTeam.isSporting}
                  />
                </div>
                <div className="shrink-0 hidden md:block">
                  <TeamCrest
                    crestUrl={match.awayTeam.crestUrl}
                    teamName={match.awayTeam.name}
                    size="lg"
                    isSporting={match.awayTeam.isSporting}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] md:text-xl truncate max-w-full">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>

            {/* Estadio */}
            {match.venue && (
              <div className="flex items-center justify-center border-t border-[var(--border)]/60 pt-3 text-center">
                <span className="text-xs font-medium text-[var(--foreground-muted)]">
                  {match.venue}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 py-8 text-center">
            <p className="text-sm text-[var(--foreground-muted)]">
              {dict.season.match.noMatchInfo}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
