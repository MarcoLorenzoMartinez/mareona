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

interface AuthCredentialsFormProps {
  readonly initialMode: "signin" | "signup";
  readonly onSuccess: (isNewUser: boolean) => void;
}

export function AuthCredentialsForm({
  initialMode,
  onSuccess,
}: AuthCredentialsFormProps) {
  const router = useRouter();
  const { setDemoSession, refreshProfile } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [isEmailJustConfirmed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("email_confirmed") === "true";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Development demo bypass
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

    if (tab === "signin") {
      const res = await signInWithPassword({ email, password });
      if (!res.success) {
        setIsSubmitting(false);
        if (res.data?.requiresEmailConfirmation) {
          setPendingConfirmationEmail(email);
          return;
        }
        return setErrorMessage(res.error ?? "No se pudo iniciar sesión");
      }
      await refreshProfile();
      router.refresh();
      setIsSubmitting(false);
      onSuccess(false);
    } else {
      const res = await signUpWithPassword({ email, password });
      if (!res.success) {
        setIsSubmitting(false);
        return setErrorMessage(res.error ?? "No se pudo registrar la cuenta");
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
    return (
      <AuthConfirmationNotice
        email={pendingConfirmationEmail}
        onBack={() => setPendingConfirmationEmail(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {isEmailJustConfirmed && tab === "signin" && (
        <div
          role="status"
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-800"
        >
          Correo confirmado. Inicia sesión con tu contraseña para continuar.
        </div>
      )}

      <div className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => { setTab("signin"); setErrorMessage(null); }}
          className={`min-h-[40px] rounded-lg py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${tab === "signin" ? "bg-white text-neutral-900 shadow-2xs font-bold" : "text-neutral-600 hover:text-neutral-900"}`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => { setTab("signup"); setErrorMessage(null); }}
          className={`min-h-[40px] rounded-lg py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${tab === "signup" ? "bg-white text-neutral-900 shadow-2xs font-bold" : "text-neutral-600 hover:text-neutral-900"}`}
        >
          Crear cuenta
        </button>
      </div>

      <GoogleSignInButton onSuccess={onSuccess} onError={setErrorMessage} />

      <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200" />
        <span>o con tu correo</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="auth-email-input" className="block text-xs font-semibold text-neutral-700 mb-1">
            Correo electrónico
          </label>
          <input
            id="auth-email-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aficionado@ejemplo.com"
            className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label htmlFor="auth-password-input" className="block text-xs font-semibold text-neutral-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="auth-password-input"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-11 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-r-lg cursor-pointer"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-medium text-[var(--primary)]">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow-xs hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
        >
          {isSubmitting ? "Cargando..." : tab === "signin" ? "Entrar" : "Crear mi cuenta"}
        </button>
      </form>
    </div>
  );
}
