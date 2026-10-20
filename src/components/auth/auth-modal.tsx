// Client: Modal de acceso familiar con inicio de sesión, registro y bienvenida opcional
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthCredentialsForm } from "./auth-credentials-form";
import { OnboardingStep } from "./onboarding-step";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();
  const [step, setStep] = useState<"credentials" | "onboarding">("credentials");

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleCredentialsSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      setStep("onboarding");
    } else {
      closeAuthModal();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Acceso a Mareona"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Comunidad Mareona
            </span>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar ventana"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === "onboarding" ? (
          <OnboardingStep onFinish={closeAuthModal} />
        ) : (
          <AuthCredentialsForm
            initialMode={authModalMode}
            onSuccess={handleCredentialsSuccess}
          />
        )}
      </div>
    </div>
  );
}
