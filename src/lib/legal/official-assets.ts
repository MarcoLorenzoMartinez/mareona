/**
 * Global legal killswitch defined in docs/LEGAL-ASSETS.md.
 * When `NEXT_PUBLIC_SHOW_OFFICIAL_ASSETS` is explicitly set to `"false"`,
 * all official club crests, player photos, and archival club imagery are replaced
 * by neutral placeholders across the entire UI without code changes.
 *
 * @returns True when official third-party visual assets may be rendered.
 */
export function areOfficialAssetsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_OFFICIAL_ASSETS !== "false";
}
