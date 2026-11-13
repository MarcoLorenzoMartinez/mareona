// Client: Carga el script de Google Identity Services y renderiza su botón oficial en el DOM
"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogleCredential } from "@/lib/auth/google-sign-in";
import {
  GOOGLE_GSI_SCRIPT_URL,
  clampGoogleButtonWidth,
  createGoogleNonce,
  getGoogleIdentity,
} from "@/lib/auth/google-identity";

interface GoogleIdentityButtonProps {
  readonly clientId: string;
  readonly onSuccess: (isNewUser: boolean) => void;
  readonly onError: (message: string) => void;
  /** Called when the Google script cannot load (ad blockers, offline) so a fallback can take over. */
  readonly onUnavailable: () => void;
}

/**
 * Official "Sign in with Google" button in popup mode. Google shows the app origin
 * (`mareona.vercel.app`) instead of the Supabase project host, and the user never leaves the page.
 */
export function GoogleIdentityButton({
  clientId,
  onSuccess,
  onError,
  onUnavailable,
}: GoogleIdentityButtonProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(() => getGoogleIdentity() !== null);
  const [isRendered, setIsRendered] = useState(false);

  // Callbacks are read through refs so re-renders of the parent never re-initialise GIS.
  const handlersRef = useRef({ onSuccess, onError });
  useEffect(() => {
    handlersRef.current = { onSuccess, onError };
  });

  useEffect(() => {
    const container = containerRef.current;
    const google = getGoogleIdentity();
    if (!isScriptReady || !container || !google) return;

    let cancelled = false;
    void createGoogleNonce().then((nonce) => {
      if (cancelled) return;
      // GIS logs a console warning when initialised more than once; the fresh nonce per
      // mount is worth it because a nonce must never be reused across sign-in attempts.
      google.initialize({
        client_id: clientId,
        nonce: nonce.hashed,
        ux_mode: "popup",
        callback: async ({ credential }) => {
          const result = await signInWithGoogleCredential(createClient().auth, credential, nonce.raw);
          if (!result.success) return handlersRef.current.onError(result.error ?? "");
          router.refresh();
          handlersRef.current.onSuccess(Boolean(result.data?.isNewUser));
        },
      });
      container.replaceChildren();
      google.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "center",
        locale: "es",
        width: clampGoogleButtonWidth(container.clientWidth),
      });
      setIsRendered(true);
    });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [isScriptReady, clientId, router]);

  return (
    <div className="relative min-h-[44px]">
      <Script
        src={GOOGLE_GSI_SCRIPT_URL}
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(getGoogleIdentity() !== null)}
        onError={onUnavailable}
      />
      {!isRendered && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-10 animate-pulse rounded-lg bg-neutral-100"
        />
      )}
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
