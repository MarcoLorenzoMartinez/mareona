"use server";

import { checkAdminSession } from "./guard";

/**
 * Server Action callable from Client Components to verify if the active session
 * has verified administrator privileges in the database.
 *
 * @returns Promise resolving to true if current user is verified admin, false otherwise.
 */
export async function checkCurrentUserAdminAction(): Promise<boolean> {
  const result = await checkAdminSession();
  return result !== null;
}
