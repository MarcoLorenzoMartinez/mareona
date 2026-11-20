// Client: Aviso minimalista de confirmación de correo pendiente con opción de reenvío
"use client";

import { useState, useTransition } from "react";
import { resendConfirmationEmail } from "@/lib/auth/actions";
import { getDictionary } from "@/i18n";

interface AuthConfirmationNoticeProps {
  readonly email: string;
  readonly onBack: () => void;
}

export function AuthConfirmationNotice({
  email,
  onBack,
}: AuthConfirmationNoticeProps) {
  const dict = getDictionary();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  const handleResend = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await resendConfirmationEmail(email);
      if (res.success) {
        setFeedbackType("success");
        setFeedback(dict.auth.confirmation.resentSuccess);
      } else {
        setFeedbackType("error");
        setFeedback(res.error || dict.auth.confirmation.resentErrorFallback);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold tracking-tight text-neutral-900">
          {dict.auth.confirmation.title}
        </h3>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {dict.auth.confirmation.sentToPrefix}{" "}
          <span className="font-semibold text-neutral-900 break-all">{email}</span>.
        </p>
        <p className="text-xs text-neutral-500">
          {dict.auth.confirmation.spamHint}
        </p>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
            feedbackType === "success"
              ? "border-neutral-200 bg-neutral-50 text-neutral-800"
              : "border-red-200 bg-red-50 text-[var(--primary)]"
          }`}
        >
          {feedback}
        </div>
      )}

      <div className="pt-1 space-y-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 active:scale-[0.99] transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
        >
          {isPending ? dict.auth.confirmation.resending : dict.auth.confirmation.resendButton}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[40px] w-full items-center justify-center rounded-lg py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
        >
          {dict.auth.confirmation.backButton}
        </button>
      </div>
    </div>
  );
}
