import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { shouldTriggerOnboarding } from "@/lib/auth/new-user";
import { sanitizeNextPath } from "@/lib/auth/oauth-redirect";

const VALID_OTP_TYPES: ReadonlySet<EmailOtpType> = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function parseOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  return VALID_OTP_TYPES.has(raw as EmailOtpType) ? (raw as EmailOtpType) : null;
}

/**
 * Handles OAuth (PKCE `code`) and email confirmation (`token_hash` + `type`) callbacks.
 *
 * Exchanges temporary authorization codes or OTP token hashes for persistent session
 * cookies via the Server-Side Supabase client, then redirects to the target view.
 *
 * @param request - Incoming HTTP request with `code` or `token_hash`/`type` query params.
 * @returns Redirect response with session cookies set, or fallback with status indicator.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = parseOtpType(searchParams.get("type"));
  const safeNext = sanitizeNextPath(searchParams.get("next"));

  if (tokenHash && otpType) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });

      if (!error && data?.user) {
        return buildAuthenticatedRedirect(request, origin, safeNext, data.user, otpType);
      }
    } catch {
      // Fall through to error redirect
    }
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        return buildAuthenticatedRedirect(request, origin, safeNext, data.user, otpType);
      }
    } catch {
      // Supabase connection failure or missing cross-browser PKCE verifier
    }
  }

  const fallbackUrl = new URL(safeNext, origin);
  fallbackUrl.searchParams.set("email_confirmed", "true");
  return NextResponse.redirect(fallbackUrl);
}

function buildAuthenticatedRedirect(
  request: NextRequest,
  origin: string,
  safeNext: string,
  user: User,
  otpType: EmailOtpType | null
): NextResponse {
  const { searchParams } = new URL(request.url);
  const needsOnboarding = shouldTriggerOnboarding({
    createdAt: user.created_at,
    otpType,
    explicitOnboardingParam: searchParams.get("onboarding"),
  });

  const isPwa = searchParams.get("pwa") === "1";
  const targetUrl = new URL(safeNext, origin);

  if (needsOnboarding) {
    targetUrl.searchParams.set("onboarding", "true");
  }
  if (isPwa && !targetUrl.searchParams.has("source")) {
    targetUrl.searchParams.set("source", "pwa");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (!isLocalEnv && forwardedHost) {
    targetUrl.protocol = "https:";
    targetUrl.host = forwardedHost;
  }

  return NextResponse.redirect(targetUrl);
}
