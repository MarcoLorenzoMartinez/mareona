import Link from "next/link";
import type { FeaturedEphemeris } from "@/lib/historical/featured-ephemeris";
import { PlayerPhoto } from "@/components/media/player-photo";
import { TeamCrest } from "@/components/media/team-crest";
import { getDictionary } from "@/i18n";

interface TodayInHistoryCardProps {
  readonly featured: FeaturedEphemeris;
}

/**
 * Historical spotlight for the current day:
 * Context header with format 'Liga, Jornada 11' and a clean confrontation card.
 */
export function TodayInHistoryCard({ featured }: TodayInHistoryCardProps) {
  const dict = getDictionary().home.history;
  const isMatch = Boolean(featured.isMatch && featured.homeTeam && featured.awayTeam);
  const isSportingHome = featured.homeTeam === "Real Sporting";
  const matchHref = featured.matchId
    ? `/historico/efemerides?partido=${encodeURIComponent(featured.matchId)}`
    : "/historico/efemerides";

  return (
    <section
      aria-label={dict.title}
      className="flex flex-1 flex-col rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 sm:px-5 sm:py-4 shadow-2xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
        <h2 className="text-base font-bold text-[var(--foreground)]">{dict.title}</h2>
        <Link
          href="/historico/efemerides"
          className="shrink-0 rounded-xs text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)]"
        >
          {dict.link} &rarr;
        </Link>
      </div>

      <div className="mt-2.5 flex flex-1 flex-col gap-2.5">
        {/* Cabecera contextual: Año en rojo tipográfico y 'Competición, Jornada' o título del hito */}
        <div className="flex min-w-0 items-baseline gap-2 text-xs">
          {featured.year !== null && (
            <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--primary)]">
              {featured.year}
            </span>
          )}
          {isMatch ? (
            <span className="truncate font-medium text-[var(--foreground-muted)]">
              {featured.competition || featured.detail}
              {featured.round ? `, ${featured.round}` : ""}
            </span>
          ) : (
            <h3 className="truncate text-sm font-bold text-[var(--foreground)]">
              {featured.title}
            </h3>
          )}
        </div>

        {isMatch ? (
          <Link
            href={matchHref}
            className="group flex flex-1 flex-col justify-center rounded-xl border border-[var(--border)] bg-neutral-50/60 p-3.5 transition-all duration-150 hover:border-[var(--primary)]/50 hover:bg-white hover:shadow-2xs active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {/* Marcador central limpio y proporcionado */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              {/* Equipo Local */}
              <div className="flex items-center justify-end gap-2 text-right min-w-0">
                <span
                  className={`truncate text-xs sm:text-sm ${
                    isSportingHome
                      ? "font-bold text-[var(--foreground)]"
                      : "font-medium text-[var(--foreground-muted)]"
                  }`}
                >
                  {featured.homeTeam}
                </span>
                <TeamCrest
                  crestUrl={featured.homeCrestUrl}
                  teamName={featured.homeTeam ?? "Local"}
                  size="md"
                  isSporting={isSportingHome}
                />
              </div>

              {/* Cápsula del tanteo */}
              <div className="shrink-0 rounded-full border border-[var(--border)] bg-white px-3.5 py-1 text-center text-sm sm:text-base font-black font-sans tabular-nums text-[var(--foreground)] shadow-2xs">
                {featured.homeScore ?? 0} – {featured.awayScore ?? 0}
              </div>

              {/* Equipo Visitante */}
              <div className="flex items-center justify-start gap-2 text-left min-w-0">
                <TeamCrest
                  crestUrl={featured.awayCrestUrl}
                  teamName={featured.awayTeam ?? "Visitante"}
                  size="md"
                  isSporting={!isSportingHome}
                />
                <span
                  className={`truncate text-xs sm:text-sm ${
                    !isSportingHome
                      ? "font-bold text-[var(--foreground)]"
                      : "font-medium text-[var(--foreground-muted)]"
                  }`}
                >
                  {featured.awayTeam}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          /* Hito o efeméride no partido (personaje / leyenda) sin recuadro anidado */
          <div className="flex flex-1 items-center gap-3.5">
            {featured.photoUrl && (
              <div className="shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
                <PlayerPhoto
                  photoUrl={featured.photoUrl}
                  playerName={featured.figure ?? featured.title}
                  size="custom"
                  className="h-18 w-18 object-cover object-top rounded-lg"
                />
              </div>
            )}
            <p
              title={featured.detail}
              className="flex-1 min-w-0 text-xs leading-snug text-[var(--foreground-muted)] font-medium line-clamp-4"
            >
              {featured.detail}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
