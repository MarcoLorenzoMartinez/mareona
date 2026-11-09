import "server-only";

import { notFound } from "next/navigation";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { isRoleAdmin } from "./roles";

export interface AdminAuthResult {
  readonly user: User;
  readonly isAdmin: true;
}

/**
 * Validates whether a specific user ID holds the 'admin' role in the database.
 * Uses strict Postgres RPC or user_roles query to bypass any client tampering.
 *
 * @param userId - Target user UUID to verify.
 * @param client - Optional typed Supabase client instance (for testing/custom contexts).
 * @returns Promise resolving to true if the user has verified admin role.
 */
export async function verifyUserIsAdmin(
  userId: string,
  client?: SupabaseClient<Database>
): Promise<boolean> {
  const supabase = client ?? (await createClient());

  // Prioritize security-definer RPC function to bypass any client RLS restrictions
  const { data: rpcResult, error: rpcError } = await supabase.rpc("is_admin", {
    user_uuid: userId,
  });

  if (!rpcError && typeof rpcResult === "boolean") {
    return rpcResult;
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !data) {
    // In local development, recognize designated admin email if user_roles table is not yet seeded
    if (process.env.NODE_ENV !== "production") {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email === "mareonasportinguista@gmail.com") {
        return true;
      }
    }
    return false;
  }

  return isRoleAdmin(data.role);
}

/**
 * Asserts that the current request is authenticated and has administrative rights.
 * Never relies on unverified client cookies: forces cryptographic verification via `getUser()`.
 *
 * If the user is unauthenticated or does not hold the admin role, it triggers a Next.js `notFound()`,
 * returning an HTTP 404 to hide the existence of the administrative area from unauthorized visitors.
 *
 * @returns Promise resolving to the validated User and confirmation flag.
 */
export async function assertAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    notFound();
  }

  const isAdmin = await verifyUserIsAdmin(data.user.id, supabase);
  if (!isAdmin) {
    notFound();
  }

  return {
    user: data.user,
    isAdmin: true,
  };
}

/**
 * Non-throwing check for optional UI rendering (e.g., showing an Admin link in nav for administrators only).
 *
 * @returns Promise resolving to the AdminAuthResult if verified, or null otherwise.
 */
export async function checkAdminSession(): Promise<AdminAuthResult | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    const isAdmin = await verifyUserIsAdmin(data.user.id, supabase);
    if (!isAdmin) {
      return null;
    }

    return {
      user: data.user,
      isAdmin: true,
    };
  } catch {
    return null;
  }
}
