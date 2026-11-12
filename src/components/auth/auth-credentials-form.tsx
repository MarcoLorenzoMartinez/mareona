// Client: Formulario familiar de credenciales con Google, Email y Contraseña
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { evaluateDemoAuth } from "@/lib/auth/demo-credentials";
import { buildOAuthCallbackUrl } from "@/lib/auth/oauth-redirect";
import { AuthConfirmationNotice } from "./auth-confirmation-notice";

interface AuthCredentialsFormProps {
  readonly initialMode: "signin" | "signup";
  readonly onSuccess: (isNewUser: boolean) => void;
}

export function AuthCredentialsForm({
  initialMode,
  onSuccess,
}: AuthCredentialsFormProps) {
  const { setDemoSession } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  const handleOAuthGoogle = async () => {
    try {
      const supabase = createClient();
      const callbackUrl = buildOAuthCallbackUrl(window.location.origin, window.location.pathname);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (error) setErrorMessage(error.message);
    } catch {
      setErrorMessage("No se pudo conectar con Google en este momento.");
    }
  };

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
      setIsSubmitting(false);
      if (!res.success) return setErrorMessage(res.error ?? "No se pudo iniciar sesión");
      onSuccess(false);
    } else {
      const res = await signUpWithPassword({ email, password });
      setIsSubmitting(false);
      if (!res.success) return setErrorMessage(res.error ?? "No se pudo registrar la cuenta");
      if (res.data?.requiresEmailConfirmation) return setPendingConfirmationEmail(email);
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

      <button
        type="button"
        onClick={handleOAuthGoogle}
        className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 active:scale-[0.99] transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continuar con Google</span>
      </button>

      <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200" />
        <span>o con tu correo</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aficionado@ejemplo.com"
            className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow-xs hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          {isSubmitting ? "Cargando..." : tab === "signin" ? "Entrar" : "Crear mi cuenta"}
        </button>
      </form>
    </div>
  );
}
