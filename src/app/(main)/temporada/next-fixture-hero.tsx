import Image from "next/image";
import { TeamCrest } from "@/components/media/team-crest";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";

interface NextFixtureHeroProps {
  readonly match: DomainMatchSummary | null;
}

/**
 * Formats match kickoff timestamp according to Europe/Madrid timezone.
 */
function formatKickoff(dateStr: string): { date: string; time: string } {
  try {
    const d = new Date(dateStr);
    const date = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
    const time = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
    return { date, time };
  } catch {
    return { date: "Próximamente", time: "--:--" };
  }
}

/**
 * Hero card spotlighting Real Sporting's upcoming or latest match,
 * including stadium photography, official crests, kickoff time, and venue.
 */
export function NextFixtureHero({ match }: NextFixtureHeroProps) {
  const dict = getDictionary();
  const matchKickoff = match ? formatKickoff(match.kickoffAt) : null;
  const stadiumAsset = match
    ? getStadiumAsset({
        teamExternalId: match.homeTeam.externalId,
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
        </div>

        {match && matchKickoff ? (
          <div className="relative z-10">
            <div className="grid grid-cols-1 items-center gap-6 py-6 md:grid-cols-7">
              {/* Equipo Local */}
              <div className="flex items-center justify-start gap-3.5 md:col-span-3 md:justify-end">
                <span className="text-lg font-bold text-[var(--foreground)] md:text-xl">
                  {match.homeTeam.name}
                </span>
                <TeamCrest
                  crestUrl={match.homeTeam.crestUrl}
                  teamName={match.homeTeam.name}
                  size="lg"
                  isSporting={match.homeTeam.isSporting}
                />
              </div>

              {/* Marcador / Horario */}
              <div className="flex flex-col items-center justify-center rounded-md bg-[var(--surface)]/90 backdrop-blur-xs py-3 px-4 text-center md:col-span-1 shadow-2xs border border-[var(--border)]/40">
                <span className="text-xs font-bold tracking-widest text-[var(--foreground-muted)] uppercase">
                  {matchKickoff.date}
                </span>
                <span className="text-2xl font-black tracking-tight text-[var(--foreground)]">
                  {match.status === "finished" &&
                  match.homeScore !== null &&
                  match.awayScore !== null
                    ? `${match.homeScore} - ${match.awayScore}`
                    : match.isTimeConfirmed === false
                    ? dict.season.match.vs
                    : matchKickoff.time}
                </span>
              </div>

              {/* Equipo Visitante */}
              <div className="flex items-center justify-start gap-3.5 md:col-span-3">
                <TeamCrest
                  crestUrl={match.awayTeam.crestUrl}
                  teamName={match.awayTeam.name}
                  size="lg"
                  isSporting={match.awayTeam.isSporting}
                />
                <span className="text-lg font-bold text-[var(--foreground)] md:text-xl">
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
