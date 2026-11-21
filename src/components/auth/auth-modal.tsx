// Client: Modal de acceso familiar con inicio de sesión, registro y bienvenida opcional
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { abortRegistration } from "@/lib/auth/actions";
import { isOnboardingEligible } from "@/lib/auth/new-user";
import { toast } from "@/lib/ui/toast";
import { AuthCredentialsForm } from "./auth-credentials-form";
import { OnboardingStep } from "./onboarding-step";
import { getDictionary } from "@/i18n";

export function AuthModal() {
  const dict = getDictionary();
  const { user, profile, isLoading, isAuthModalOpen, closeAuthModal, authModalMode, handleSignOut } = useAuth();
  const [prevMode, setPrevMode] = useState(authModalMode);
  const [step, setStep] = useState<"credentials" | "onboarding">(() =>
    authModalMode === "onboarding" ? "onboarding" : "credentials"
  );
  const [isAborting, setIsAborting] = useState(false);
  const [didJustSignUp, setDidJustSignUp] = useState(false);
  const isBackdropMouseDownRef = useRef(false);

  if (prevMode !== authModalMode) {
    setPrevMode(authModalMode);
    setStep(authModalMode === "onboarding" ? "onboarding" : "credentials");
  }

  const canRunOnboarding =
    step === "onboarding" &&
    !isLoading &&
    isOnboardingEligible({
      hasUser: Boolean(user),
      explicitSignupFlow: didJustSignUp,
      userCreatedAt: user?.created_at,
      profileCreatedAt: profile?.created_at,
      profileUpdatedAt: profile?.updated_at,
    });

  const handleClose = useCallback(() => {
    setDidJustSignUp(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let mutated = false;
      if (url.searchParams.has("onboarding")) {
        url.searchParams.delete("onboarding");
        mutated = true;
      }
      if (url.searchParams.has("email_confirmed")) {
        url.searchParams.delete("email_confirmed");
        mutated = true;
      }
      if (mutated) {
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
    closeAuthModal();
  }, [closeAuthModal]);

  const handleAbortRegistration = useCallback(async () => {
    if (!user || !canRunOnboarding) {
      handleClose();
      return;
    }

    if (typeof window !== "undefined" && !window.confirm(dict.auth.modal.confirmAbortRegistration)) {
      return;
    }

    setIsAborting(true);
    const res = await abortRegistration();
    if (!res.success) {
      setIsAborting(false);
      toast.error(res.error ?? dict.auth.modal.cancelRegistrationAria);
      return;
    }
    await handleSignOut();
    handleClose();
    setIsAborting(false);
  }, [user, canRunOnboarding, dict.auth.modal.cancelRegistrationAria, dict.auth.modal.confirmAbortRegistration, handleSignOut, handleClose]);

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isBackdropMouseDownRef.current = e.target === e.currentTarget;
  };

  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if mousedown AND mouseup occurred on the backdrop (prevents closing when selecting input text)
    if (isBackdropMouseDownRef.current && e.target === e.currentTarget) {
      // Never dismiss onboarding step accidentally via backdrop click
      if (step !== "onboarding") {
        handleClose();
      }
    }
    isBackdropMouseDownRef.current = false;
  };

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow closing via Escape in credentials mode, not during identity onboarding
      if (e.key === "Escape" && step !== "onboarding") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen, step, handleClose]);

  if (!isAuthModalOpen) return null;

  const handleCredentialsSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      setDidJustSignUp(true);
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
      aria-label={dict.auth.modal.dialogAria}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 pt-16 shadow-2xl border border-neutral-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={canRunOnboarding ? handleAbortRegistration : handleClose}
          disabled={isAborting}
          className="absolute top-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          aria-label={canRunOnboarding ? dict.auth.modal.cancelRegistrationAria : dict.auth.modal.closeAria}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {canRunOnboarding || (step === "onboarding" && isLoading) ? (
          <OnboardingStep
            key={`${user?.id ?? "loading"}-${profile?.username ?? ""}`}
            onFinish={handleClose}
            onCancel={handleAbortRegistration}
          />
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
