// Client: Pantalla de confirmación de correo pendiente con opción de reenvío
"use client";

import { useState, useTransition } from "react";
import { Mail, CheckCircle2, RotateCw, ArrowLeft } from "lucide-react";
import { resendConfirmationEmail } from "@/lib/auth/actions";

interface AuthConfirmationNoticeProps {
  readonly email: string;
  readonly onBack: () => void;
}

export function AuthConfirmationNotice({
  email,
  onBack,
}: AuthConfirmationNoticeProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  const handleResend = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await resendConfirmationEmail(email);
      if (res.success) {
        setFeedbackType("success");
        setFeedback("Correo de confirmación reenviado");
      } else {
        setFeedbackType("error");
        setFeedback(res.error || "No se pudo reenviar el correo");
      }
    });
  };

  return (
    <div className="flex flex-col items-center text-center py-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--primary)] mb-3 shadow-2xs">
        <Mail className="h-6 w-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-bold text-neutral-900">
        ¡Casi listo! Revisa tu correo
      </h3>

      <p className="mt-2 text-xs text-neutral-600 leading-relaxed max-w-xs">
        Hemos enviado un enlace de confirmación a:
      </p>

      <p className="mt-1 text-xs font-bold text-neutral-900 break-all bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
        {email}
      </p>

      <p className="mt-2 text-[11px] text-neutral-500 max-w-xs">
        Abre el enlace que encontrarás en el mensaje para activar tu cuenta y entrar a Mareona.
      </p>

      {feedback && (
        <div
          role="status"
          className={`mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            feedbackType === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-[var(--primary)] border-red-200"
          }`}
        >
          {feedbackType === "success" && <CheckCircle2 className="h-3.5 w-3.5" />}
          <span>{feedback}</span>
        </div>
      )}

      <div className="mt-5 w-full space-y-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          <span>{isPending ? "Reenviando..." : "¿No lo has recibido? Reenviar correo"}</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-1 py-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Volver al formulario</span>
        </button>
      </div>
    </div>
  );
}
