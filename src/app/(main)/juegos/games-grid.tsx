// Client: Reacciona al estado de conexión para informar y atenuar juegos que requieren red
"use client";

import { useOfflineGuard } from "@/lib/pwa/use-offline-guard";
import { GAMES } from "./types";
import { GameCard } from "./game-card";
import { getDictionary } from "@/i18n";

/**
 * Grid of games with progressive enhancement for network status:
 * when offline, online-dependent games are dimmed and explain themselves on tap.
 */
export function GamesGrid() {
  const dict = getDictionary();
  const { isBlocked, guardNavigation } = useOfflineGuard();

  return (
    <section
      aria-label={dict.games.hub.gridAria}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {GAMES.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isDisabled={isBlocked(game.href)}
          onNavigate={guardNavigation}
        />
      ))}
    </section>
  );
}
