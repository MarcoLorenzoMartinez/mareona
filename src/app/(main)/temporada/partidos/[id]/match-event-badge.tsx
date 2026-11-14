import type { DomainMatchEvent } from "@/lib/sports-api/types";
import { SoccerBallIcon } from "@/components/icons/soccer-ball-icon";
import { MissedPenaltyIcon } from "@/components/icons/missed-penalty-icon";

interface MatchEventBadgeProps {
  readonly type: DomainMatchEvent["type"];
  readonly isSporting?: boolean;
  readonly score?: string;
  readonly isSecondYellow?: boolean;
  readonly isPenalty?: boolean;
}

/**
 * Visual badge for match events (goal, penalty goal, yellow card, red card, double yellow, missed penalty).
 * Note: Substitutions handle their own inline indicators directly.
 */
export function MatchEventBadge({
  type,
  isSporting = false,
  score,
  isSecondYellow = false,
  isPenalty = false,
}: MatchEventBadgeProps) {
  switch (type) {
    case "goal": {
      const cleanScore = score ? score.replace(/\s+/g, "") : "";
      if (cleanScore) {
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-sans tabular-nums text-white shadow-2xs shrink-0 ${
              isSporting ? "bg-[var(--primary)]" : "bg-neutral-900"
            }`}
            title={isPenalty ? `Gol de penalti (${cleanScore})` : `Gol (${cleanScore})`}
            aria-label={isPenalty ? `Gol de penalti (${cleanScore})` : `Gol (${cleanScore})`}
          >
            <SoccerBallIcon className="h-3.5 w-3.5 shrink-0" size={14} />
            <span className="leading-none">{cleanScore}</span>
          </span>
        );
      }
      return (
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white shadow-2xs ${
            isSporting ? "bg-[var(--primary)]" : "bg-neutral-900"
          }`}
          title={isPenalty ? "Gol de penalti" : "Gol"}
          aria-label={isPenalty ? "Gol de penalti" : "Gol"}
        >
          <SoccerBallIcon className="h-3.5 w-3.5" size={14} />
        </span>
      );
    }
    case "yellowCard":
      return (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center"
          title="Tarjeta amarilla"
          aria-label="Tarjeta amarilla"
        >
          <span className="h-4 w-3 rounded-[2px] bg-amber-400 border border-amber-500 shadow-2xs" />
        </span>
      );
    case "redCard":
      if (isSecondYellow) {
        return (
          <span
            className="relative flex h-6 w-6 shrink-0 items-center justify-center"
            title="Segunda tarjeta amarilla (expulsión)"
            aria-label="Segunda tarjeta amarilla (expulsión)"
          >
            <span
              className="absolute left-0.5 top-1 h-3.5 w-2.5 rounded-[2px] bg-amber-400 border border-amber-500 shadow-2xs -rotate-12"
              aria-hidden="true"
            />
            <span
              className="relative z-10 left-1 top-0 h-3.5 w-2.5 rounded-[2px] bg-red-600 border border-red-700 shadow-2xs rotate-6"
              aria-hidden="true"
            />
          </span>
        );
      }
      return (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center"
          title="Tarjeta roja"
          aria-label="Tarjeta roja"
        >
          <span className="h-4 w-3 rounded-[2px] bg-red-600 border border-red-700 shadow-2xs" />
        </span>
      );
    case "penaltyMissed":
      return (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 border border-rose-300 shadow-2xs"
          title="Penalti fallado"
          aria-label="Penalti fallado"
        >
          <MissedPenaltyIcon className="h-4 w-4" size={16} />
        </span>
      );
    default:
      return null;
  }
}
