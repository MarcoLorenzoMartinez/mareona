// Client: Cronología visual de eventos del encuentro (goles, tarjetas y cambios)
"use client";

import { useState, useMemo } from "react";
import type { HistoricalMatchGoal, HistoricalMatchPlayer } from "@/lib/historical/types";
import { SoccerBallIcon } from "@/components/icons/soccer-ball-icon";
import { buildTimelineEvents, type MatchTimelineEvent } from "./match-timeline-builder";

interface MatchDetailEventsProps {
  readonly goals: readonly HistoricalMatchGoal[];
  readonly homeStarters?: readonly HistoricalMatchPlayer[];
  readonly awayStarters?: readonly HistoricalMatchPlayer[];
  readonly homeBench?: readonly HistoricalMatchPlayer[];
  readonly awayBench?: readonly HistoricalMatchPlayer[];
  readonly homeTeam: string;
  readonly awayTeam: string;
}

function EventDetail({
  event,
  isSporting,
  isLeft,
}: {
  readonly event: MatchTimelineEvent;
  readonly isSporting: boolean;
  readonly isLeft: boolean;
}) {
  const dir = isLeft ? "flex-row" : "flex-row-reverse";
  if (event.type === "goal") {
    return (
      <div className={`flex items-center gap-1.5 min-w-0 ${dir}`}>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">{event.primaryText}</span>
          {event.note && (
            <span className={`text-[10px] font-bold ${event.note === "Penalti" ? "text-amber-700" : "text-red-600"}`}>
              {event.note}
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold font-sans tabular-nums text-white shadow-2xs shrink-0 ${
            isSporting ? "bg-[var(--primary)]" : "bg-neutral-900"
          }`}
          title={`Gol (${event.badge})`}
        >
          <SoccerBallIcon className="h-3 w-3 shrink-0" size={12} />
          <span>{event.badge}</span>
        </span>
      </div>
    );
  }
  if (event.type === "yellow" || event.type === "red") {
    const isY = event.type === "yellow";
    return (
      <div className={`flex items-center gap-1.5 min-w-0 ${dir}`}>
        <span className={`text-xs truncate ${isY ? "font-semibold text-[var(--foreground)]" : "font-bold text-red-700"}`}>
          {event.primaryText}
        </span>
        <span
          className={`w-2.5 h-3.5 rounded-2xs shadow-2xs shrink-0 inline-block border ${
            isY ? "bg-amber-400 border-amber-500/40" : "bg-red-600 border-red-700/40"
          }`}
          title={isY ? "Tarjeta amarilla" : "Tarjeta roja"}
        />
      </div>
    );
  }
  return (
    <div className={`flex flex-col min-w-0 text-[11px] leading-tight ${isLeft ? "items-end" : "items-start"}`}>
      <span className="font-bold text-emerald-700 truncate inline-flex items-center gap-1">
        <span className="text-emerald-600 font-black">↑</span> {event.primaryText}
      </span>
      {event.secondaryText && (
        <span className="text-neutral-500 truncate inline-flex items-center gap-1 text-[10px]">
          <span className="text-neutral-600 font-bold">↓</span> {event.secondaryText}
        </span>
      )}
    </div>
  );
}

/**
 * Visual chronological match timeline displaying goals (default) or all events (toggle).
 */
export function HistoricalMatchEvents({
  goals,
  homeStarters,
  awayStarters,
  homeBench,
  awayBench,
  homeTeam,
  awayTeam,
}: MatchDetailEventsProps) {
  const [showAllEvents, setShowAllEvents] = useState<boolean>(false);
  const allEvents = useMemo(
    () => buildTimelineEvents(goals, homeStarters, awayStarters, homeBench, awayBench),
    [goals, homeStarters, awayStarters, homeBench, awayBench]
  );
  if (allEvents.length === 0) return null;

  const hasExtraEvents = allEvents.some((e) => e.type !== "goal");
  const events = showAllEvents ? allEvents : allEvents.filter((e) => e.type === "goal");
  if (events.length === 0 && !hasExtraEvents) return null;

  const isHomeSporting = homeTeam === "Real Sporting";
  const isAwaySporting = awayTeam === "Real Sporting";

  return (
    <div className="my-3 max-w-xl mx-auto rounded-xl border border-[var(--border)] bg-neutral-50/70 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          Eventos del encuentro
        </span>
        {hasExtraEvents && (
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-200/70 border border-neutral-300/60 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setShowAllEvents(false)}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                !showAllEvents ? "bg-white text-[var(--foreground)] shadow-2xs" : "text-neutral-600 hover:text-[var(--foreground)]"
              }`}
            >
              Goles
            </button>
            <button
              type="button"
              onClick={() => setShowAllEvents(true)}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                showAllEvents ? "bg-[var(--primary)] text-white shadow-2xs" : "text-neutral-600 hover:text-[var(--foreground)]"
              }`}
            >
              Todos
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-[var(--border)]" aria-hidden="true" />
        <div className="space-y-2">
          {events.length > 0 ? (
            events.map((e, idx) => {
              const isSporting = e.isHome ? isHomeSporting : isAwaySporting;
              return (
                <div
                  key={`${e.type}-${e.primaryText}-${e.minute}-${idx}`}
                  className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-1"
                >
                  <div className="flex items-center justify-end text-right min-w-0">
                    {e.isHome && <EventDetail event={e} isSporting={isSporting} isLeft />}
                  </div>
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold font-sans tabular-nums text-[var(--foreground-muted)] border border-[var(--border)] shadow-2xs">
                      {e.minuteDisplay || e.minute}&apos;
                    </span>
                  </div>
                  <div className="flex items-center justify-start text-left min-w-0">
                    {!e.isHome && <EventDetail event={e} isSporting={isSporting} isLeft={false} />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-2 text-xs text-[var(--foreground-muted)]">Sin goles en el encuentro</div>
          )}
        </div>
      </div>
    </div>
  );
}
