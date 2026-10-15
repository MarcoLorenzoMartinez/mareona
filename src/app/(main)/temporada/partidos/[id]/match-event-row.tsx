import type { DomainMatchEvent } from "@/lib/sports-api/types";
import { MatchEventBadge } from "./match-event-badge";

function cleanName(name: string): string {
  return name.trim().toLowerCase() === "jorge" ? "Jorge Sáenz" : name;
}

interface EventDetailsProps {
  readonly event: DomainMatchEvent;
  readonly assistLabel: string;
  readonly penaltyMissedLabel: string;
}

function EventDetails({ event, assistLabel, penaltyMissedLabel }: EventDetailsProps) {
  const playerName = cleanName(event.player.name);
  const secondaryName = event.secondaryPlayer ? cleanName(event.secondaryPlayer.name) : "";
  const isGoal = event.type === "goal";
  const isPenaltyMissed = event.type === "penaltyMissed";

  if (event.type === "substitution") {
    return (
      <div className={`flex flex-col text-xs ${event.isHome ? "items-end text-right" : "items-start text-left"}`}>
        <span className="flex items-center gap-1 font-medium text-emerald-700">
          <span className="text-[10px] font-bold" aria-hidden="true">▲</span>
          <span>{playerName}</span>
        </span>
        {secondaryName && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--foreground-muted)]">
            <span className="text-[10px] text-neutral-400 font-bold" aria-hidden="true">▼</span>
            <span>{secondaryName}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${event.isHome ? "items-end text-right" : "items-start text-left"}`}>
      <span className={`text-xs sm:text-sm text-[var(--foreground)] ${isGoal ? "font-semibold" : "font-medium"}`}>
        {playerName}
      </span>
      {isGoal && secondaryName && (
        <span
          className={`text-[11px] text-[var(--foreground-muted)] font-normal flex items-center gap-1 ${
            event.isHome ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-neutral-400 font-medium select-none" aria-hidden="true">
            {event.isHome ? "↲" : "↳"}
          </span>
          <span>asist. {secondaryName}</span>
        </span>
      )}
      {isPenaltyMissed && (
        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
          {penaltyMissedLabel || "Penalti fallado"}
        </span>
      )}
    </div>
  );
}

interface EventRowProps {
  readonly event: DomainMatchEvent;
  readonly assistLabel: string;
  readonly penaltyMissedLabel: string;
}

export function EventRow({ event, assistLabel, penaltyMissedLabel }: EventRowProps) {
  const isGoal = event.type === "goal";
  const isSub = event.type === "substitution";

  return (
    <li className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-1.5">
      {/* Lado Local (alineado hacia el centro) */}
      <div className="flex items-center justify-end gap-2 text-right">
        {event.isHome && (
          <>
            <EventDetails
              event={event}
              assistLabel={assistLabel}
              penaltyMissedLabel={penaltyMissedLabel}
            />
            {!isSub && (
              <MatchEventBadge
                type={event.type}
                isSporting={event.isSporting}
                score={event.score}
              />
            )}
          </>
        )}
      </div>

      {/* Nodo del Minuto en la Espina Central */}
      <div className="relative z-10 flex items-center justify-center">
        <span
          className={`flex items-center justify-center rounded-full min-w-8 px-2 py-0.5 font-sans text-xs font-semibold tabular-nums shadow-2xs transition-colors ${
            isGoal
              ? event.isSporting
                ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                : "bg-neutral-900 text-white border border-neutral-900"
              : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
          }`}
        >
          {event.minute}
        </span>
      </div>

      {/* Lado Visitante (alineado hacia el centro) */}
      <div className="flex items-center justify-start gap-2 text-left">
        {!event.isHome && (
          <>
            {!isSub && (
              <MatchEventBadge
                type={event.type}
                isSporting={event.isSporting}
                score={event.score}
              />
            )}
            <EventDetails
              event={event}
              assistLabel={assistLabel}
              penaltyMissedLabel={penaltyMissedLabel}
            />
          </>
        )}
      </div>
    </li>
  );
}
