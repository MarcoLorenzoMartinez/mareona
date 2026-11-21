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
  fallbackUrl.searchParams.set("auth_error", "callback_failed");
  return NextResponse.redirect(fallbackUrl);
}

function resolveAllowedHost(request: NextRequest, candidateHost: string | null): string | null {
  if (!candidateHost) return null;
  const normalized = candidateHost.trim().toLowerCase();
  const allowedHosts = new Set<string>(["mareona.vercel.app"]);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      allowedHosts.add(new URL(process.env.NEXT_PUBLIC_APP_URL).host.toLowerCase());
    } catch {
      // Ignore malformed env URL
    }
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowedHosts.add(process.env.VERCEL_PROJECT_PRODUCTION_URL.toLowerCase());
  }
  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL.toLowerCase());
  }
  allowedHosts.add(request.nextUrl.host.toLowerCase());

  return allowedHosts.has(normalized) ? normalized : null;
}

function buildAuthenticatedRedirect(
  request: NextRequest,
  origin: string,
  safeNext: string,
  user: User,
  otpType: EmailOtpType | null
): NextResponse {
  if (otpType === "recovery") {
    const resetUrl = new URL("/auth/reset-password", origin);
    const allowedHost = resolveAllowedHost(request, request.headers.get("x-forwarded-host"));
    if (process.env.NODE_ENV !== "development" && allowedHost) {
      resetUrl.protocol = "https:";
      resetUrl.host = allowedHost;
    }
    return NextResponse.redirect(resetUrl);
  }

  const { searchParams } = new URL(request.url);
  const needsOnboarding = shouldTriggerOnboarding({
    createdAt: user.created_at,
    otpType,
    explicitOnboardingParam: searchParams.get("onboarding"),
  });

  const isPwa = searchParams.get("pwa") === "1";
  const targetUrl = new URL(safeNext, origin);

  if (otpType === "signup") {
    targetUrl.searchParams.set("email_confirmed", "true");
  }
  if (needsOnboarding) {
    targetUrl.searchParams.set("onboarding", "true");
  }
  if (isPwa && !targetUrl.searchParams.has("source")) {
    targetUrl.searchParams.set("source", "pwa");
  }

  const allowedHost = resolveAllowedHost(request, request.headers.get("x-forwarded-host"));
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (!isLocalEnv && allowedHost) {
    targetUrl.protocol = "https:";
    targetUrl.host = allowedHost;
  }

  return NextResponse.redirect(targetUrl);
}
