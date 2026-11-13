import { googleCredentialSchema } from "./schemas.ts";
import { isRecentSignup } from "./new-user.ts";
import type { AuthActionResult } from "./types.ts";

/**
 * Minimal slice of the Supabase auth client needed here, so the flow can be unit tested
 * without a network or a real client.
 */
export interface IdTokenAuthClient {
  signInWithIdToken(params: {
    provider: "google";
    token: string;
    nonce: string;
  }): Promise<{
    data: { user: { created_at: string } | null };
    error: { message: string } | null;
  }>;
}

const GENERIC_ERROR = "No se pudo iniciar sesión con Google. Inténtalo de nuevo.";

/**
 * Exchanges a Google ID token for a Supabase session without leaving the page.
 * Runs in the browser so the client emits `SIGNED_IN` and the session cookies are written
 * for server components in the same step.
 *
 * @param client - Supabase auth client.
 * @param credential - ID token (JWT) delivered by Google Identity Services.
 * @param rawNonce - Unhashed nonce whose SHA-256 digest was given to Google.
 * @returns `isNewUser` so the caller can route fresh accounts to onboarding.
 */
export async function signInWithGoogleCredential(
  client: IdTokenAuthClient,
  credential: string | undefined,
  rawNonce: string
): Promise<AuthActionResult<{ readonly isNewUser: boolean }>> {
  const parsed = googleCredentialSchema.safeParse({ credential, nonce: rawNonce });
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };

  try {
    const { data, error } = await client.signInWithIdToken({
      provider: "google",
      token: parsed.data.credential,
      nonce: parsed.data.nonce,
    });
    if (error || !data.user) return { success: false, error: GENERIC_ERROR };
    return { success: true, data: { isNewUser: isRecentSignup(data.user.created_at) } };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}
