// Client: Formulario accesible para establecer nueva contraseña tras recuperación
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePassword } from "@/lib/auth/actions";

/**
 * Interactive password reset form rendered on `/auth/reset-password`.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await updatePassword({ password, confirmPassword });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error ?? "No se pudo actualizar la contraseña");
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/temporada");
      router.refresh();
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
        Contraseña actualizada correctamente. Redirigiendo...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-password" className="block text-sm font-semibold text-neutral-900 mb-1.5">
          Nueva contraseña
        </label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-base text-neutral-900 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
      </div>

      <div>
        <label htmlFor="reset-password-confirm" className="block text-sm font-semibold text-neutral-900 mb-1.5">
          Confirmar contraseña
        </label>
        <input
          id="reset-password-confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-base text-neutral-900 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[44px] rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:opacity-60"
      >
        {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
      </button>

      <div className="pt-2 text-center">
        <Link href="/temporada" className="text-sm font-semibold text-[var(--primary-strong)] hover:underline">
          Volver a Mareona
        </Link>
      </div>
    </form>
  );
}
