// Client: Actualización reactiva en vivo del partido del Real Sporting en la cabecera
"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMatchDate, formatMatchTime } from "@/lib/sports-api/dates";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { useLiveFixturePoll } from "./use-live-fixture-poll";
import { HeroTeamCell } from "./hero-team-cell";
import { HeroScoreboard } from "./hero-scoreboard";

interface NextFixtureHeroProps {
  readonly match: DomainMatchSummary | null;
}

/**
 * Hero card spotlighting Real Sporting's upcoming or in-play match.
 * Automatically polls for score updates when status is 'live' and pauses when tab is hidden.
 */
export function NextFixtureHero({ match: initialMatch }: NextFixtureHeroProps) {
  const { match, isLive } = useLiveFixturePoll(initialMatch);
  const dict = getDictionary();

  const isTimeConfirmed = match?.isTimeConfirmed ?? true;
  const matchKickoff = match
    ? {
        date: formatMatchDate(match.kickoffAt, isTimeConfirmed, false),
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

  const isFinished =
    match?.status === "finished" &&
    match.homeScore !== null &&
    match.awayScore !== null;

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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
              {match
                ? `${match.roundName ? `${match.roundName} · ` : match.matchday ? `${dict.season.match.matchday} ${match.matchday} · ` : ""}${match.competition}`
                : dict.season.match.nextFixture}
            </span>
            {isLive && (
              <span className="rounded-xs bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                {dict.season.matchDetail.status.live}
              </span>
            )}
          </div>
          {match && (
            <Link
              href={`/temporada/partidos/${match.externalId}`}
              className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs"
            >
              {dict.season.matchDetail.title} →
            </Link>
          )}
        </div>

        {match && matchKickoff ? (
          <div className="relative z-10">
            <div className="grid grid-cols-7 items-center gap-2 py-4 md:gap-6 md:py-6">
              <HeroTeamCell team={match.homeTeam} isHome={true} />
              <HeroScoreboard
                dateLabel={matchKickoff.date}
                timeLabel={matchKickoff.time}
                homeScore={match.homeScore}
                awayScore={match.awayScore}
                isLive={isLive}
                isFinished={isFinished}
                isTimeConfirmed={isTimeConfirmed}
              />
              <HeroTeamCell team={match.awayTeam} isHome={false} />
            </div>

            {match.venue && (
              <div className="flex items-center justify-center border-t border-[var(--border)]/60 pt-3 text-center">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {match.venue}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 py-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              {dict.season.match.noMatchInfo}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
