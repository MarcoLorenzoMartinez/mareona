/**
 * Routes that must stay usable without connectivity. Shared by the offline
 * fallback page and guarded against drift with `public/sw.js` by a unit test.
 */
export const OFFLINE_PRECACHE_PATHS = [
  "/offline",
  "/juegos",
  "/juegos/wordle",
  "/juegos/who-are-ya",
  "/juegos/pregunta-del-dia",
  "/juegos/mayor-menor",
  "/historico",
  "/historico/comparador",
  "/historico/efemerides",
  "/historico/legado",
  "/historico/rivales",
] as const;

export interface OfflineLink {
  readonly href: string;
  readonly label: string;
}

export const OFFLINE_GAME_LINKS: readonly OfflineLink[] = [
  { href: "/juegos/wordle", label: "Wordle" },
  { href: "/juegos/who-are-ya", label: "¿Quién es?" },
  { href: "/juegos/pregunta-del-dia", label: "Pregunta del día" },
  { href: "/juegos/mayor-menor", label: "Mayor o menor" },
];

export const OFFLINE_ARCHIVE_LINKS: readonly OfflineLink[] = [
  { href: "/historico", label: "Archivo histórico" },
  { href: "/historico/efemerides", label: "Efemérides" },
  { href: "/historico/legado", label: "Legado" },
  { href: "/historico/rivales", label: "Rivales" },
];

/**
 * Evaluates whether a given pathname is supported offline.
 * Historical archive and daily games operate offline; live screens, porra,
 * album and social require network.
 */
export function isOfflineRoute(pathname: string): boolean {
  if (pathname === "/offline") return true;
  if (pathname.startsWith("/historico")) return true;
  if (pathname.startsWith("/juegos")) {
    if (pathname.startsWith("/juegos/porra") || pathname.startsWith("/juegos/album")) {
      return false;
    }
    return true;
  }
  return false;
}
