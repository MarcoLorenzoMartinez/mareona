import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Refreshes user auth tokens stored in cookies on incoming requests.
 * Ensures Server Components and Client Components maintain a synchronized,
 * unexpired session across reloads and route navigations.
 *
 * @param request Incoming Next.js HTTP request.
 * @returns NextResponse preserving refreshed Supabase session cookies.
 */
export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

  // If Supabase redirects to the root Site URL with an auth code or OTP token_hash,
  // forward immediately to /auth/callback so the session is properly exchanged.
  if (
    pathname !== "/auth/callback" &&
    (searchParams.has("code") || (searchParams.has("token_hash") && searchParams.has("type")))
  ) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    if (!callbackUrl.searchParams.has("next") && pathname !== "/") {
      callbackUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    // Calling getUser() triggers @supabase/ssr token refresh and cookie updating
    await supabase.auth.getUser();
  } catch {
    // Offline mode, network interruption or unauthenticated state
  }

  return supabaseResponse;
}
