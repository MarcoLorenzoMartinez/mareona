export type InstallPlatform =
  /** Already running as an installed app. */
  | "installed"
  /** Browser handed us a deferred native install prompt. */
  | "native-prompt"
  /** iOS/iPadOS Safari-like browser: installation is manual via Share. */
  | "ios"
  /** Embedded webview (Instagram, WhatsApp…) that cannot install anything. */
  | "in-app"
  /** Browser without an install prompt: rely on its own menu. */
  | "manual";

export interface InstallEnvironment {
  readonly userAgent: string;
  readonly platform: string;
  readonly maxTouchPoints: number;
  readonly isStandalone: boolean;
  readonly hasDeferredPrompt: boolean;
}

const IN_APP_BROWSER_PATTERN =
  /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|MicroMessenger|Snapchat|TikTok|; wv\)/i;

/**
 * Detects iPhone, iPod and iPad. iPadOS 13+ reports itself as "MacIntel",
 * so touch support is the only reliable discriminator from a real Mac.
 */
export function isIosDevice(env: Pick<InstallEnvironment, "userAgent" | "platform" | "maxTouchPoints">): boolean {
  if (/iPad|iPhone|iPod/.test(env.userAgent)) return true;
  return env.platform === "MacIntel" && env.maxTouchPoints > 1;
}

/**
 * Decides which installation flow the visitor should see. Order matters:
 * an installed app never gets prompts, and webviews are excluded before the
 * iOS check because iOS webviews cannot add to the home screen either.
 *
 * @param env Snapshot of the browser capabilities.
 * @returns The install flow to present.
 */
export function resolveInstallPlatform(env: InstallEnvironment): InstallPlatform {
  if (env.isStandalone) return "installed";
  if (IN_APP_BROWSER_PATTERN.test(env.userAgent)) return "in-app";
  if (env.hasDeferredPrompt) return "native-prompt";
  if (isIosDevice(env)) return "ios";
  return "manual";
}
