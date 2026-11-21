import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña | Mareona",
  robots: { index: false, follow: false },
};

/**
 * Password recovery destination page linked after `/auth/callback?type=recovery`.
 */
export default function ResetPasswordPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-white px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary)] mb-2">
          Mareona
        </p>
        <h1 className="text-2xl font-extrabold text-neutral-900 mb-6">
          Elegir nueva contraseña
        </h1>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
