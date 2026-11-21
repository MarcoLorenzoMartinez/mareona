// Client: Vista integrada de solicitud de recuperación de contraseña
"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth/actions";
import { getDictionary } from "@/i18n";

interface ForgotPasswordViewProps {
  readonly initialEmail: string;
  readonly onBack: () => void;
}

export function ForgotPasswordView({ initialEmail, onBack }: ForgotPasswordViewProps) {
  const dict = getDictionary();
  const t = dict.auth.forgotPassword;
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await requestPasswordReset(email);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error ?? t.errorFallback);
      return;
    }
    setIsSent(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-neutral-900">{t.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-600">{t.subtitle}</p>
      </div>

      {isSent ? (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed font-medium text-emerald-900">
          {t.sentNotice}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="forgot-email-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              {dict.auth.credentials.emailLabel}
            </label>
            <input
              id="forgot-email-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.auth.credentials.emailPlaceholder}
              className="w-full min-h-[44px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
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
            {isSubmitting ? t.submitting : t.submitButton}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="flex min-h-[44px] w-full items-center justify-center rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
      >
        {t.backToSignIn}
      </button>
    </div>
  );
}
