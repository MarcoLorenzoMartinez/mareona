import Link from "next/link";
import type { FeaturedEphemeris } from "@/lib/historical/featured-ephemeris";
import { PlayerPhoto } from "@/components/media/player-photo";
import { TeamCrest } from "@/components/media/team-crest";
import { getDictionary } from "@/i18n";

interface TodayInHistoryCardProps {
  readonly featured: FeaturedEphemeris;
}

/**
 * Historical spotlight for the current day, styled like the Efemérides hub:
 * year capsule, title, photograph/crest and factual context with match scorers.
 */
export function TodayInHistoryCard({ featured }: TodayInHistoryCardProps) {
  const dict = getDictionary().home.history;
  const isMatch = Boolean(featured.isMatch);

  return (
    <section
      aria-label={dict.title}
      className="flex flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <h2 className="text-base font-bold text-[var(--foreground)]">{dict.title}</h2>
        <Link
          href="/historico/efemerides"
          className="shrink-0 rounded-xs text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)]"
        >
          {dict.link} &rarr;
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {featured.year !== null && (
            <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-white">
              {featured.year}
            </span>
          )}
          <h3 className="text-sm font-bold leading-snug text-[var(--foreground)] sm:text-base">
            {featured.title}
          </h3>
        </div>

        <div className="flex items-start gap-3.5">
          {featured.photoUrl && (
            <div className="shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-neutral-50 flex items-center justify-center p-2">
              {isMatch ? (
                <TeamCrest
                  crestUrl={featured.photoUrl}
                  teamName={featured.figure ?? "Rival"}
                  size="lg"
                />
              ) : (
                <PlayerPhoto
                  photoUrl={featured.photoUrl}
                  playerName={featured.figure ?? featured.title}
                  size="lg"
                  className="h-20 w-20 object-cover object-top sm:h-24 sm:w-24 rounded-lg"
                />
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <p className="text-xs leading-relaxed text-[var(--foreground-muted)] sm:text-sm font-medium">
              {featured.detail}
              {featured.venue ? ` · ${featured.venue}` : ""}
            </p>

            {isMatch && featured.sportingScorers && featured.sportingScorers.length > 0 && (
              <div className="mt-1 flex flex-col gap-1 text-xs">
                <div className="flex items-start gap-1.5 leading-snug">
                  <span className="font-bold text-[var(--foreground)] shrink-0">Goles RSG:</span>
                  <span className="text-[var(--foreground-muted)] font-sans tabular-nums">
                    {featured.sportingScorers.join(", ")}
                  </span>
                </div>
                {featured.opponentScorers && featured.opponentScorers.length > 0 && (
                  <div className="flex items-start gap-1.5 leading-snug">
                    <span className="font-semibold text-neutral-500 shrink-0">Rival:</span>
                    <span className="text-neutral-500 font-sans tabular-nums">
                      {featured.opponentScorers.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
