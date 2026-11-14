/**
 * Routes that must stay usable without connectivity. Shared by the offline
 * fallback page and guarded against drift with `public/sw.js` by a unit test.
 */
export const OFFLINE_PRECACHE_PATHS = [
  "/offline",
  "/juegos",
  "/juegos/wordle",
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
 * album, quien-es and social require network.
 */
export function isOfflineRoute(pathname: string): boolean {
  const cleanPath = pathname.split(/[?#]/)[0];
  if (cleanPath === "/offline") return true;
  if (cleanPath.startsWith("/historico")) return true;
  if (cleanPath.startsWith("/juegos")) {
    if (
      cleanPath.startsWith("/juegos/porra") ||
      cleanPath.startsWith("/juegos/album") ||
      cleanPath.startsWith("/juegos/quien-es") ||
      cleanPath.startsWith("/juegos/who-are-ya")
    ) {
      return false;
    }
    return true;
  }
  return false;
}

/** Ordered most specific first: the first matching prefix provides the explanation. */
const OFFLINE_BLOCK_REASONS: readonly (readonly [string, string])[] = [
  ["/juegos/porra", "La Porra necesita internet para guardar tus pronósticos."],
  ["/juegos/album", "Memoria Rojiblanca necesita internet para sincronizar tus cromos."],
  ["/juegos/quien-es", "¿Quién es? necesita internet para cargar las fotos."],
  ["/juegos/who-are-ya", "¿Quién es? necesita internet para cargar las fotos."],
  ["/temporada", "Temporada necesita internet para mostrar datos al día."],
  ["/social", "Social necesita internet para cargar la conversación."],
  ["/perfil", "Tu perfil necesita internet."],
];

export interface OfflineBlockCopy {
  readonly title: string;
  readonly description: string;
}

/**
 * Explains why a destination cannot be opened without connectivity.
 *
 * @param pathname Destination path of a link or navigation attempt.
 * @returns Copy for the user, or `null` when the route works offline.
 */
export function getOfflineBlockCopy(pathname: string): OfflineBlockCopy | null {
  if (isOfflineRoute(pathname)) return null;
  const path = pathname.split(/[?#]/)[0];
  const reason = OFFLINE_BLOCK_REASONS.find(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`)
  );
  const description =
    path === "/"
      ? "Inicio muestra datos en directo y necesita internet."
      : (reason?.[1] ?? "Esta sección necesita internet.");
  return { title: "Sin conexión", description };
}
