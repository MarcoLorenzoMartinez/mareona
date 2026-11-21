import type { DomainPlayer } from "@/lib/sports-api/types";
import { PlayerCard } from "./player-card";

interface SquadGroupProps {
  readonly title: string;
  readonly players: readonly DomainPlayer[];
  readonly priorityFirst?: boolean;
}

/**
 * Tactical section group with uppercase athletic heading and responsive 4-column card grid.
 * Matches the layout of the user's reference design.
 *
 * @param title Section heading in uppercase (e.g., "PORTEROS", "DEFENSAS").
 * @param players Array of DomainPlayer items for this position group.
 */
export function SquadGroup({ title, players, priorityFirst = false }: SquadGroupProps) {
  if (players.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={`heading-${title}`} className="flex flex-col gap-3.5">
      <h2
        id={`heading-${title}`}
        className="text-base font-black text-[var(--foreground)] tracking-wider uppercase"
      >
        {title}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            priority={priorityFirst && index < 4}
          />
        ))}
      </div>
    </section>
  );
}
