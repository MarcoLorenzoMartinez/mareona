// Client: Prioriza Google Identity Services en todos los entornos (web y PWA), con fallback a redirección
"use client";

import { useState } from "react";
import { GoogleIdentityButton } from "./google-identity-button";
import { GoogleRedirectButton } from "./google-redirect-button";

interface GoogleSignInButtonProps {
  readonly onSuccess: (isNewUser: boolean) => void;
  readonly onError: (message: string) => void;
}

/**
 * Prefers the in-page Google popup in all contexts (including installed PWAs) so users see
 * `mareona.vercel.app` instead of the Supabase project host. Gracefully falls back to the
 * redirect flow if no client ID is configured or if the Google script is blocked/unavailable.
 */
export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [mustRedirect, setMustRedirect] = useState(() => !clientId);

  if (mustRedirect || !clientId) {
    return <GoogleRedirectButton onError={onError} />;
  }

  return (
    <GoogleIdentityButton
      clientId={clientId}
      onSuccess={onSuccess}
      onError={onError}
      onUnavailable={() => setMustRedirect(true)}
    />
  );
}
