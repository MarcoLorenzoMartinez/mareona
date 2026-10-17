import type { EphemerisMilestone } from "@/lib/historical/ephemerides-types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface EphemeridesMilestonesListProps {
  readonly milestones: readonly EphemerisMilestone[];
}

/**
 * Renders verified club milestones, legendary birthdays, and iconic moments for the day.
 * Features a white background, corporate red border, year in a rounded red pill,
 * authentic photographs, and concise factual descriptions.
 */
export function EphemeridesMilestonesList({ milestones }: EphemeridesMilestonesListProps) {
  if (milestones.length === 0) return null;

  return (
    <section aria-label="Hitos y efemérides históricas de la fecha" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
        Hitos
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {milestones.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-[var(--primary)] bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs"
          >
            <div className="flex flex-col gap-3">
              {/* Header: Year in rounded red pill + Event Title */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {item.year && (
                  <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white font-sans tabular-nums shadow-2xs">
                    {item.year}
                  </span>
                )}
                <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-snug">
                  {item.title}
                </h4>
              </div>

              {/* Body: Photo + Factual Description */}
              <div className="flex items-start gap-3.5">
                {item.photoUrl && (
                  <div className="shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-neutral-50 shadow-2xs">
                    <PlayerPhoto
                      photoUrl={item.photoUrl}
                      playerName={item.figure ?? item.title}
                      size="lg"
                      className="h-24 w-24 sm:h-28 sm:w-28 object-cover object-top"
                    />
                  </div>
                )}

                <p className="flex-1 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
