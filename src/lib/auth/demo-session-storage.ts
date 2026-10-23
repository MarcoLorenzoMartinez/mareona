import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "./types";

export const DEMO_STORAGE_KEY = "mareona_demo_session";

export interface StoredDemoSession {
  readonly user: User;
  readonly profile: UserProfile;
}

/**
 * Retrieves the persisted demo session from browser localStorage.
 *
 * @returns Stored demo session or null if empty, invalid or outside browser environment.
 */
export function getStoredDemoSession(): StoredDemoSession | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDemoSession>;
    if (parsed?.user?.id && parsed?.profile?.id) {
      return parsed as StoredDemoSession;
    }
  } catch {
    // Graceful fallback for blocked storage, security restrictions or corrupt data
  }
  return null;
}

/**
 * Persists an active demo session into browser localStorage.
 *
 * @param user Supabase User-compatible object.
 * @param profile Associated demo user profile row.
 */
export function saveDemoSession(user: User, profile: UserProfile): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify({ user, profile })
    );
  } catch {
    // Quota limits or private browsing restrictions
  }
}

/**
 * Removes any persisted demo session from browser localStorage.
 */
export function clearStoredDemoSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // Inaccessible storage
  }
}

/**
 * Updates partial properties of the active demo user profile in localStorage.
 *
 * @param updates Partial profile changes (e.g. avatar, display name, points).
 * @returns The newly updated UserProfile or null if no demo session exists.
 */
export function updateStoredDemoProfile(
  updates: Partial<UserProfile>
): UserProfile | null {
  const current = getStoredDemoSession();
  if (!current) return null;

  const updatedProfile: UserProfile = { ...current.profile, ...updates };
  saveDemoSession(current.user, updatedProfile);
  return updatedProfile;
}
