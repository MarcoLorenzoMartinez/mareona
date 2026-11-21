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
 * Sanitizes a raw redirect path to prevent open redirect vulnerabilities.
 *
 * @param rawNext - Raw `next` query parameter.
 * @returns Safe internal relative path defaulting to `/temporada`.
 */
export function sanitizeNextPath(rawNext: string | null | undefined): string {
  if (!rawNext || typeof rawNext !== "string") return "/temporada";
  const trimmed = rawNext.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return "/temporada";
  }
  try {
    const parsed = new URL(trimmed, "https://mareona.local");
    if (parsed.origin !== "https://mareona.local") {
      return "/temporada";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/temporada";
  }
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
  const normalized = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
  const safePath = sanitizeNextPath(normalized);
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

/**
 * Builds the email confirmation callback URL used in `supabase.auth.signUp` and `resend`.
 * Includes `onboarding=true` so that even if the user opens the confirmation email minutes
 * or hours later on a mobile device, the callback route triggers identity onboarding.
 *
 * @param origin - Application origin URL.
 * @param nextPath - Internal path to redirect after confirmation.
 * @returns Fully qualified `/auth/callback` URL for email confirmation links.
 */
export function buildEmailConfirmationUrl(
  origin: string,
  nextPath: string = "/temporada"
): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", sanitizeNextPath(nextPath));
  callbackUrl.searchParams.set("onboarding", "true");
  return callbackUrl.toString();
}
