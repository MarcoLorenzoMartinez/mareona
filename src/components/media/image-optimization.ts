const OPTIMIZABLE_REMOTE_EXACT_HOSTS = new Set([
  "www.bdfutbol.com",
  "a.espncdn.com",
  "images.fotmob.com",
  "media.api-sports.io",
  "flagcdn.com",
]);

const OPTIMIZABLE_REMOTE_SUFFIXES = [
  ".googleusercontent.com",
  ".supabase.co",
  ".espncdn.com",
  ".fotmob.com",
] as const;

/**
 * Checks whether an image URL can safely pass through Next.js `<Image>` optimization
 * (local raster assets or HTTPS hosts explicitly listed in `next.config.ts` `remotePatterns`).
 * Excludes SVGs so Next.js does not reject unconfigured SVG optimization.
 */
export function isNextImageSupportedUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".svg?")) return false;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (OPTIMIZABLE_REMOTE_EXACT_HOSTS.has(host)) return true;
    return OPTIMIZABLE_REMOTE_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}
