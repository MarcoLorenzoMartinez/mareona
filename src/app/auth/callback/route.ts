import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles OAuth callback verification (PKCE flow) for Supabase authentication.
 *
 * Exchanges the temporary authorization code returned by providers such as Google
 * for persistent session cookies via the Server-Side Supabase client.
 *
 * @param request - Incoming HTTP request with `code` and optional `next` redirect query params.
 * @returns Redirect response to target destination with session cookies set, or error fallback.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");

  // Prevent open redirect vulnerabilities by strictly requiring relative paths
  let safeNext = "/temporada";
  if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")) {
    safeNext = rawNext;
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        // Detect newly created user accounts (created in the last 60 seconds)
        // to present the mandatory name & handle selection screen
        const createdAtMs = new Date(data.user.created_at).getTime();
        const isRecentSignup = Math.abs(Date.now() - createdAtMs) < 60_000;

        const targetUrl = new URL(safeNext, origin);
        if (isRecentSignup) {
          targetUrl.searchParams.set("onboarding", "true");
        }

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (!isLocalEnv && forwardedHost) {
          targetUrl.protocol = "https:";
          targetUrl.host = forwardedHost;
        }
        return NextResponse.redirect(targetUrl);
      }
    } catch {
      // Supabase connection failure or invalid PKCE code
    }
  }

  // Fallback destination when code is missing or exchange fails
  return NextResponse.redirect(`${origin}/temporada?auth_error=oauth_exchange_failed`);
}
