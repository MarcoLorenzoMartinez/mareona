import type { DomainMatchEvent } from "@/lib/sports-api/types";
import { SoccerBallIcon } from "@/components/icons/soccer-ball-icon";

interface MatchMomentumMarkerProps {
  readonly event: DomainMatchEvent;
  readonly isTop: boolean;
}

/**
 * Visual badge for key match events in the momentum chart.
 * Renders a geometric Lucide-style soccer ball with the updated score for goals,
 * or a regulatory red card badge, accompanied by an accessible hover tooltip.
 */
export function MatchMomentumMarker({ event, isTop }: MatchMomentumMarkerProps) {
  const isGoal = event.type === "goal";
  const cleanScore = event.score ? event.score.replace(/\s+/g, "") : "";
  const label = `${event.minute} ${isGoal ? `Gol (${cleanScore})` : "Tarjeta roja"} — ${event.player.name}`;

  return (
    <div
      tabIndex={0}
      aria-label={label}
      className="group relative flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] rounded-full"
    >
      {isGoal ? (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold font-sans tabular-nums text-white shadow-2xs select-none ${
            event.isSporting ? "bg-[var(--primary)]" : "bg-neutral-900"
          }`}
        >
          <SoccerBallIcon className="h-3 w-3 shrink-0" size={12} />
          {cleanScore && <span className="leading-none">{cleanScore}</span>}
        </span>
      ) : (
        <span
          className="h-3.5 w-2.5 rounded-[1px] bg-rose-600 border border-rose-700 shadow-2xs inline-block"
          aria-hidden="true"
        />
      )}

      {/* Tooltip con detalle completo */}
      <div
        className={`hidden group-hover:flex group-focus:flex absolute ${
          isTop ? "bottom-full mb-1.5" : "top-full mt-1.5"
        } left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-[10px] font-medium font-sans text-white shadow-md pointer-events-none`}
      >
        <span>
          {event.minute} {isGoal ? "Gol" : "Roja"} · {event.player.name}
          {cleanScore ? ` (${cleanScore})` : ""}
        </span>
      </div>
    </div>
  );
}
