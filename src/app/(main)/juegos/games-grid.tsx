// Client: Reacciona al estado de conexión para informar y atenuar juegos que requieren red
"use client";

import Link from "next/link";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";
import { toast } from "@/lib/ui/toast";

interface GameItem {
  readonly id: string;
  readonly title: string;
  readonly tag: string;
  readonly href: string;
  readonly requiresOnline: boolean;
}

const GAMES: readonly GameItem[] = [
  {
    id: "album",
    title: "Memoria Rojiblanca",
    tag: "Colección",
    href: "/juegos/album",
    requiresOnline: true,
  },
  {
    id: "porra",
    title: "La Porra de la Mareona",
    tag: "Jornada",
    href: "/juegos/porra",
    requiresOnline: true,
  },
  {
    id: "wordle",
    title: "Wordle",
    tag: "Diario",
    href: "/juegos/wordle",
    requiresOnline: false,
  },
  {
    id: "pregunta-del-dia",
    title: "La Pregunta del Día",
    tag: "Diario",
    href: "/juegos/pregunta-del-dia",
    requiresOnline: false,
  },
  {
    id: "quien-es",
    title: "¿Quién es?",
    tag: "Diario",
    href: "/juegos/who-are-ya",
    requiresOnline: true,
  },
  {
    id: "mayor-menor",
    title: "¿Mayor o Menor?",
    tag: "Récord",
    href: "/juegos/mayor-menor",
    requiresOnline: false,
  },
];

/**
 * Grid of games with progressive enhancement for network status:
 * when offline, online-dependent games are dimmed and display a non-blocking toast.
 */
export function GamesGrid() {
  const isOnline = useOnlineStatus();

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, game: GameItem) => {
    if (!isOnline && game.requiresOnline) {
      e.preventDefault();
      toast.info("Requiere conexión a internet", {
        description: `Para acceder a ${game.title} necesitas cobertura para sincronizar datos.`,
      });
    }
  };

  return (
    <section
      aria-label="Zona de juegos"
      className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {GAMES.map((game) => {
        const isDisabled = !isOnline && game.requiresOnline;

        return (
          <Link
            key={game.id}
            href={game.href}
            onClick={(e) => handleCardClick(e, game)}
            aria-disabled={isDisabled ? "true" : undefined}
            tabIndex={isDisabled ? -1 : undefined}
            className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all duration-150 select-none ${
              isDisabled
                ? "border-neutral-200 opacity-60 grayscale-40 cursor-not-allowed shadow-none"
                : "border-[var(--border)] shadow-2xs hover:border-[var(--primary)] hover:shadow-sm active:scale-[0.98] cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isDisabled
                      ? "bg-neutral-200 text-neutral-600"
                      : "bg-[var(--primary)] text-white"
                  }`}
                >
                  {game.tag}
                </span>

                {isDisabled && (
                  <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[9px] font-semibold text-neutral-500">
                    Requiere red
                  </span>
                )}
              </div>

              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                  isDisabled
                    ? "border-neutral-200 text-neutral-300"
                    : "border-[var(--border)] text-neutral-400 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
                }`}
              >
                {isDisabled ? (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            </div>

            <div className="mt-8">
              <h2
                className={`text-lg font-bold tracking-tight transition-colors ${
                  isDisabled
                    ? "text-neutral-500"
                    : "text-[var(--foreground)] group-hover:text-[var(--primary)]"
                }`}
              >
                {game.title}
              </h2>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
