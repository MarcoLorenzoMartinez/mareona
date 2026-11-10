/**
 * Evaluates whether the current browsing context is running inside an installed PWA.
 */
export function isRunningInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const isMatchMedia =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone =
    typeof navigator !== "undefined" &&
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return isMatchMedia || isIosStandalone;
}

/**
 * Builds the canonical OAuth callback URL for Supabase authentication,
 * preserving PWA standalone launch indicators so mobile operating systems
 * restore the installed app context after provider login.
 *
 * @param origin - Current window origin (e.g. `https://mareona.es` or `http://localhost:3000`).
 * @param currentPath - Target return path within the application.
 * @param forceStandalone - Optional override for unit testing.
 * @returns Fully qualified callback URL.
 */
export function buildOAuthCallbackUrl(
  origin: string,
  currentPath: string = "/temporada",
  forceStandalone?: boolean
): string {
  const isPwa = forceStandalone ?? isRunningInStandaloneMode();
  const safePath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
  const targetNext = isPwa && !safePath.includes("source=pwa")
    ? `${safePath}${safePath.includes("?") ? "&" : "?"}source=pwa`
    : safePath;

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", targetNext);
  if (isPwa) {
    callbackUrl.searchParams.set("pwa", "1");
  }
  return callbackUrl.toString();
}
