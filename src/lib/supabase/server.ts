import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Creates a typed Supabase client scoped to the current incoming request context.
 * Uses Next.js headers cookie store to hydrate user session and handle token refreshes.
 *
 * Catches cookie mutation errors during Server Component rendering because
 * Server Components operate in a streaming read-only response phase.
 *
 * @returns Promise resolving to a typed Supabase server client.
 * @throws Error if required Supabase environment variables are missing.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate response cookies directly; mutation is
          // handled either in middleware or inside subsequent Server Actions.
        }
      },
    },
  });
}
