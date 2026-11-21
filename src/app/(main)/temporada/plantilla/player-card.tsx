import Link from "next/link";
import type { DomainPlayer } from "@/lib/sports-api/types";
import { buildPlayerProfileHref } from "@/lib/sports-api/squad-routing";
import { PlayerPhoto } from "@/components/media/player-photo";

interface PlayerCardProps {
  readonly player: DomainPlayer;
  readonly priority?: boolean;
}

/**
 * Modern minimalist player card:
 * - Clean white card with subtle border and rounded-2xl corners.
 * - Large translucent red dorsal number in the background behind player photo.
 * - Centered, enlarged bust cutout photo.
 * - Bottom gradient in Sporting red seamlessly covering the photo cutout edge.
 * - Uppercase player name in crisp white typography.
 * - Clickable link navigating to detailed player profile.
 *
 * @param player DomainPlayer data model.
 */
export function PlayerCard({ player, priority = false }: PlayerCardProps) {
  const dorsalLabel =
    player.shirtNumber !== null ? `Dorsal ${player.shirtNumber}` : "";
  const href = buildPlayerProfileHref(player);

  return (
    <Link
      href={href}
      aria-label={`${player.displayName} ${dorsalLabel} — Ver perfil y estadísticas completas`}
      className="group relative flex flex-col justify-end rounded-2xl border border-[var(--border)] bg-white shadow-2xs transition-all duration-150 hover:border-neutral-300 hover:shadow-md select-none text-left overflow-hidden h-52 sm:h-72 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
    >
      {/* Dorsal: Large red number positioned on the right */}
      {player.shirtNumber !== null && (
        <div
          aria-hidden="true"
          className="absolute top-2 right-2.5 sm:right-3.5 z-0 pointer-events-none select-none"
        >
          <span className="text-5xl sm:text-7xl font-black text-[var(--primary)] opacity-35 group-hover:opacity-55 transition-opacity tabular-nums tracking-tighter leading-none">
            {player.shirtNumber}
          </span>
        </div>
      )}

      {/* Center: Enlarged player bust photo */}
      <div className="relative z-10 flex w-full items-end justify-center">
        <PlayerPhoto
          key={player.photoUrl ?? player.id}
          photoUrl={player.photoUrl}
          playerName={player.displayName}
          shirtNumber={player.shirtNumber}
          size="card"
          priority={priority}
          className="h-44 sm:h-60 transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Bottom gradient overlay: Balanced medium height, cleanly softening the bust cut without encroaching on chest */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex h-16 sm:h-22 flex-col items-center justify-end px-2.5 sm:px-3 pb-2.5 sm:pb-3 bg-gradient-to-t from-[var(--primary)] from-25% via-[var(--primary)]/60 to-transparent text-center pointer-events-none">
        <h3 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase line-clamp-1 drop-shadow-xs">
          {player.displayName}
        </h3>
      </div>
    </Link>
  );
}

