import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Creates a privileged Supabase Admin client using `SUPABASE_SERVICE_ROLE_KEY`.
 * Strictly restricted to server-only execution for fail-safe contingency operations
 * (such as auto-confirming a newly registered user when the external SMTP relay is down).
 *
 * @returns Typed Supabase client with service_role privileges, or `null` if the key is not configured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
