export const BANNER_MIN_VISITS = 2;
export const BANNER_DISMISS_MS = 14 * 24 * 60 * 60 * 1000;
export const BANNER_VISITS_KEY = "mareona_pwa_visits";
export const BANNER_SESSION_KEY = "mareona_pwa_session";
export const BANNER_DISMISSED_KEY = "mareona_pwa_banner_dismissed_at";

interface BannerInput {
  readonly platform: string | null;
  readonly pathname: string;
  readonly visits: number;
  readonly dismissedAt: number | null;
  readonly now: number;
}

/**
 * Decides whether the install banner may be shown. It waits for a returning
 * visitor (second session) and honors a dismissal for two weeks, so first-time
 * visitors are never interrupted and nobody is nagged.
 *
 * @param input Current install platform, route and persisted engagement state.
 * @returns True when the banner should be rendered.
 */
export function shouldShowInstallBanner(input: BannerInput): boolean {
  if (input.platform !== "native-prompt" && input.platform !== "ios") return false;
  if (input.pathname.startsWith("/instalar")) return false;
  if (input.visits < BANNER_MIN_VISITS) return false;
  if (input.dismissedAt !== null && input.now - input.dismissedAt < BANNER_DISMISS_MS) {
    return false;
  }
  return true;
}
