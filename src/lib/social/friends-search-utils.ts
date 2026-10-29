import type { FriendSummary } from "./friendship-schemas";

/**
 * Normalizes user search input by trimming whitespace, stripping leading @ signs,
 * and converting to lower case.
 *
 * @param query - Raw search query entered by the user
 * @returns Cleaned query string ready for lookup
 */
export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/^@+/, "").toLowerCase();
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
    const matchUsername = p.username.toLowerCase().includes(clean);
    const matchDisplayName = p.displayName ? p.displayName.toLowerCase().includes(clean) : false;
    return matchUsername || matchDisplayName;
  });
}
