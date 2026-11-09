/**
 * Pure domain logic for administrator and moderator role evaluation.
 * Kept free of Next.js server runtime bindings for maximum testability.
 */

import type { AdminRole } from "./types";

/**
 * Checks whether a given role string satisfies administrator privileges.
 *
 * @param role - Role string or null/undefined from session.
 * @returns True if the role is 'admin'.
 */
export function isRoleAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

/**
 * Checks whether a given role string satisfies staff (admin or moderator) privileges.
 *
 * @param role - Role string or null/undefined from session.
 * @returns True if the role is 'admin' or 'moderator'.
 */
export function isRoleStaff(role: string | null | undefined): role is AdminRole {
  return role === "admin" || role === "moderator";
}
