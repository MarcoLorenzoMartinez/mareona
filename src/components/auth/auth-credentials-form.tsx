// Client: Formulario familiar de credenciales con Google, Email y Contraseña
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth/actions";
import { useAuth } from "@/context/auth-context";
import { evaluateDemoAuth } from "@/lib/auth/demo-credentials";
import { AuthConfirmationNotice } from "./auth-confirmation-notice";
import { GoogleSignInButton } from "./google-sign-in-button";
import { AgeGateCheckbox } from "./age-gate-checkbox";
import { getDictionary } from "@/i18n";

interface AuthCredentialsFormProps {
  readonly initialMode: "signin" | "signup";
  readonly onSuccess: (isNewUser: boolean) => void;
}

export function AuthCredentialsForm({ initialMode, onSuccess }: AuthCredentialsFormProps) {
  const dict = getDictionary();
  const router = useRouter();
  const { setDemoSession, refreshProfile } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [isEmailJustConfirmed] = useState<boolean>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("email_confirmed") === "true"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (process.env.NODE_ENV !== "production") {
      const demo = evaluateDemoAuth(email, password, tab);
      if (demo.isDemo) {
        setIsSubmitting(false);
        if (demo.error) setErrorMessage(demo.error);
        else if (demo.user && demo.profile) {
          setDemoSession(demo.user, demo.profile);
          onSuccess(Boolean(demo.isNewUser));
        }
        return;
      }
    }

    if (tab === "signin") {
      const res = await signInWithPassword({ email, password });
      if (!res.success) {
        setIsSubmitting(false);
        if (res.data?.requiresEmailConfirmation) return setPendingConfirmationEmail(email);
        return setErrorMessage(res.error ?? dict.auth.credentials.signInErrorFallback);
      }
      await refreshProfile();
      router.refresh();
      setIsSubmitting(false);
      onSuccess(false);
    } else {
      if (!ageConfirmed) {
        setIsSubmitting(false);
        return setErrorMessage(dict.auth.ageGate.requiredError);
      }
      const res = await signUpWithPassword({ email, password, ageConfirmed });
      if (!res.success) {
        setIsSubmitting(false);
        return setErrorMessage(res.error ?? dict.auth.credentials.signUpErrorFallback);
      }
      if (res.data?.requiresEmailConfirmation) {
        setIsSubmitting(false);
        return setPendingConfirmationEmail(email);
      }
      await refreshProfile();
      router.refresh();
      setIsSubmitting(false);
      onSuccess(true);
    }
  };

  if (pendingConfirmationEmail) {
    return <AuthConfirmationNotice email={pendingConfirmationEmail} onBack={() => setPendingConfirmationEmail(null)} />;
  }

  return (
    <div className="space-y-4">
      {isEmailJustConfirmed && tab === "signin" && (
        <div role="status" className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-800">
          {dict.auth.credentials.emailConfirmedBanner}
        </div>
      )}

      <div role="tablist" aria-label={dict.auth.credentials.modeTabsAria} className="grid grid-cols-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-xs font-semibold">
        {(["signin", "signup"] as const).map((mode) => {
          const isSelected = tab === mode;
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => { setTab(mode); setErrorMessage(null); }}
              className={`min-h-[38px] rounded-full py-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
                isSelected ? "bg-[var(--primary)] text-white shadow-2xs font-bold" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {mode === "signin" ? dict.auth.credentials.signInTab : dict.auth.credentials.signUpTab}
            </button>
          );
        })}
      </div>

      <GoogleSignInButton onSuccess={onSuccess} onError={setErrorMessage} />

      <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200" />
        <span>{dict.auth.credentials.orWithEmail}</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="auth-email-input" className="block text-xs font-semibold text-neutral-700 mb-1">
            {dict.auth.credentials.emailLabel}
          </label>
          <input id="auth-email-input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.auth.credentials.emailPlaceholder} className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
        </div>

        <div>
          <label htmlFor="auth-password-input" className="block text-xs font-semibold text-neutral-700 mb-1">
            {dict.auth.credentials.passwordLabel}
          </label>
          <div className="relative">
            <input id="auth-password-input" type={showPassword ? "text" : "password"} required autoComplete={tab === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dict.auth.credentials.passwordPlaceholder} className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-11 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-r-lg cursor-pointer" aria-label={showPassword ? dict.auth.credentials.hidePasswordAria : dict.auth.credentials.showPasswordAria}>
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {tab === "signup" && <AgeGateCheckbox id="auth-age-gate" checked={ageConfirmed} onChange={setAgeConfirmed} />}

        {errorMessage && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-medium text-[var(--primary)]">{errorMessage}</div>
        )}

        <button type="submit" disabled={isSubmitting} className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow-xs hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer">
          {isSubmitting ? dict.common.loading : tab === "signin" ? dict.auth.credentials.signInSubmit : dict.auth.credentials.signUpSubmit}
        </button>
      </form>
    </div>
  );
}
