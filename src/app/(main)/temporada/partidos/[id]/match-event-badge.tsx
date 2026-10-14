import type { DomainMatchEvent } from "@/lib/sports-api/types";
import { SoccerBallIcon } from "@/components/icons/soccer-ball-icon";

interface MatchEventBadgeProps {
  readonly type: DomainMatchEvent["type"];
  readonly isSporting?: boolean;
  readonly score?: string;
}

/**
 * Visual badge for match events (goal, yellow card, red card).
 * Note: Substitutions handle their own inline indicators directly.
 */
export function MatchEventBadge({
  type,
  isSporting = false,
  score,
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
            title={`Gol (${cleanScore})`}
            aria-label={`Gol (${cleanScore})`}
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
          title="Gol"
          aria-label="Gol"
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
      return (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center"
          title="Tarjeta roja"
          aria-label="Tarjeta roja"
        >
          <span className="h-4 w-3 rounded-[2px] bg-red-600 border border-red-700 shadow-2xs" />
        </span>
      );
    default:
      return null;
  }
}
