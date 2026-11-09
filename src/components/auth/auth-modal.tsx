// Client: Modal de acceso familiar con inicio de sesión, registro y bienvenida opcional
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthCredentialsForm } from "./auth-credentials-form";
import { OnboardingStep } from "./onboarding-step";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();
  const [prevMode, setPrevMode] = useState(authModalMode);
  const [step, setStep] = useState<"credentials" | "onboarding">(() =>
    authModalMode === "onboarding" ? "onboarding" : "credentials"
  );

  if (prevMode !== authModalMode) {
    setPrevMode(authModalMode);
    setStep(authModalMode === "onboarding" ? "onboarding" : "credentials");
  }

  const handleClose = useCallback(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("onboarding")) {
        url.searchParams.delete("onboarding");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
    closeAuthModal();
  }, [closeAuthModal]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen, handleClose]);

  if (!isAuthModalOpen) return null;

  const handleCredentialsSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      setStep("onboarding");
    } else {
      handleClose();
    }
  };

  const credentialsMode = authModalMode === "signup" ? "signup" : "signin";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Acceso a Mareona"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 pt-16 shadow-2xl border border-neutral-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "onboarding" ? (
          <OnboardingStep onFinish={handleClose} />
        ) : (
          <AuthCredentialsForm
            initialMode={credentialsMode}
            onSuccess={handleCredentialsSuccess}
          />
        )}
      </div>
    </div>
  );
}
