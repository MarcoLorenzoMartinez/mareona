// Client: Elige entre Identity Services (navegador) y redirección OAuth (PWA o sin configuración)
"use client";

import { useState } from "react";
import { isRunningInStandaloneMode } from "@/lib/auth/oauth-redirect";
import { GoogleIdentityButton } from "./google-identity-button";
import { GoogleRedirectButton } from "./google-redirect-button";

interface GoogleSignInButtonProps {
  readonly onSuccess: (isNewUser: boolean) => void;
  readonly onError: (message: string) => void;
}

/**
 * Prefers the in-page Google popup, which keeps the user on the current route. Falls back to
 * the redirect flow when no client id is configured, inside an installed PWA, or when the
 * Google script is unreachable.
 */
export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [mustRedirect, setMustRedirect] = useState(() => !clientId || isRunningInStandaloneMode());

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
