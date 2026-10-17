import type { EphemerisMilestone } from "@/lib/historical/ephemerides-types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface EphemeridesMilestonesListProps {
  readonly milestones: readonly EphemerisMilestone[];
}

/**
 * Renders verified club milestones, legendary birthdays, and iconic moments for the day,
 * featuring official player and stadium photos alongside titles and descriptions.
 */
export function EphemeridesMilestonesList({ milestones }: EphemeridesMilestonesListProps) {
  if (milestones.length === 0) return null;

  return (
    <section aria-label="Hitos y efemérides históricas de la fecha" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
        Hitos
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {milestones.map((item) => {
          const isTriumph = item.category === "triumph";
          const isLegend = item.category === "legend";
          const isSigning = item.category === "signing";

          return (
            <article
              key={item.id}
              className={`flex flex-col justify-between rounded-xl border p-4 shadow-2xs transition-shadow ${
                isTriumph
                  ? "border-amber-500/30 bg-amber-500/5"
                  : isLegend
                  ? "border-[var(--primary)]/20 bg-[var(--primary)]/5"
                  : isSigning
                  ? "border-emerald-500/25 bg-emerald-500/5"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                {/* Header: Category Badge + Year */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isTriumph
                        ? "bg-amber-500/20 text-amber-800"
                        : isLegend
                        ? "bg-[var(--primary)] text-white"
                        : isSigning
                        ? "bg-emerald-500/20 text-emerald-800"
                        : "bg-[var(--surface)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.categoryLabel}
                  </span>
                  {item.year && (
                    <span className="text-xs font-bold text-[var(--foreground)] font-sans tabular-nums">
                      Año {item.year}
                    </span>
                  )}
                </div>

                {/* Content: Photo + Title & Description */}
                <div className="flex items-start gap-3">
                  {item.photoUrl && (
                    <div className="shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xs">
                      <PlayerPhoto
                        photoUrl={item.photoUrl}
                        playerName={item.figure ?? item.title}
                        size="md"
                        className="h-16 w-16 object-cover object-top"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {item.figure && (
                <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/60 pt-2 text-xs">
                  <span className="text-[var(--muted-foreground)]">Protagonista:</span>
                  <span className="font-semibold text-[var(--foreground)]">{item.figure}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
