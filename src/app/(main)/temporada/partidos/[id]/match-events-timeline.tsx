import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { EventRow } from "./match-event-row";

interface MatchEventsTimelineProps {
  readonly match: DomainMatchDetail;
}

export function MatchEventsTimeline({ match }: MatchEventsTimelineProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.events;

  if (match.events.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">
          {match.status === "scheduled" ? t.pendingEvents : t.noEvents}
        </p>
      </div>
    );
  }

  const firstHalfEvents = match.events.filter((e) => e.period === 1);
  const secondHalfEvents = match.events.filter((e) => e.period >= 2);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] border-b border-[var(--border)] pb-3 mb-4">
        {t.title}
      </h2>

      <div className="relative">
        {/* Línea central vertical que recorre toda la cronología */}
        <div
          className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-[var(--border)]"
          aria-hidden="true"
        />

        {firstHalfEvents.length > 0 && (
          <section aria-label={t.firstHalf} className="relative mb-6">
            <div className="relative z-10 my-3 flex items-center justify-center">
              <span className="rounded-full bg-[var(--surface)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)] border border-[var(--border)] shadow-2xs">
                {t.firstHalf}
              </span>
            </div>
            <ul className="space-y-1">
              {firstHalfEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  assistLabel={t.assist}
                  penaltyMissedLabel={t.penaltyMissed}
                />
              ))}
            </ul>
          </section>
        )}

        {secondHalfEvents.length > 0 && (
          <section aria-label={t.secondHalf} className="relative">
            <div className="relative z-10 my-3 flex items-center justify-center">
              <span className="rounded-full bg-[var(--surface)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)] border border-[var(--border)] shadow-2xs">
                {t.secondHalf}
              </span>
            </div>
            <ul className="space-y-1">
              {secondHalfEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  assistLabel={t.assist}
                  penaltyMissedLabel={t.penaltyMissed}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
