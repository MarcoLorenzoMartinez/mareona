import type { FriendSummary } from "./friendship-schemas";
import { normalizeSearchText, matchesSearchQuery } from "../utils/search-utils.ts";

/**
 * Normalizes user search input by trimming whitespace, stripping leading @ signs,
 * and stripping accents/diacritics.
 *
 * @param query - Raw search query entered by the user
 * @returns Cleaned query string ready for lookup
 */
export function normalizeSearchQuery(query: string): string {
  return normalizeSearchText(query.trim().replace(/^@+/, ""));
}

/**
 * Filters a list of user profiles against a search query, matching either username
 * or displayName, and excluding the active user.
 *
 * @param profiles - Candidates to filter
 * @param query - Raw or normalized search string
 * @param currentUserId - Optional ID of logged-in user to omit from results
 * @returns Matching profiles
 */
export function filterFriendsList(
  profiles: readonly FriendSummary[],
  query: string,
  currentUserId?: string | null
): readonly FriendSummary[] {
  const clean = normalizeSearchQuery(query);
  if (clean.length < 2) return [];

  return profiles.filter((p) => {
    if (currentUserId && p.id === currentUserId) {
      return false;
    }
    const matchUsername = matchesSearchQuery(p.username, clean);
    const matchDisplayName = p.displayName ? matchesSearchQuery(p.displayName, clean) : false;
    return matchUsername || matchDisplayName;
  });
}
