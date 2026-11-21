// Client: Modal accesible de denuncia de usuario o conversación con opción de bloqueo simultáneo
"use client";

import { useState, useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";
import { toast } from "@/lib/ui/toast";
import { REPORT_CATEGORIES, type ReportCategoryId } from "@/lib/social/dm-privacy-custody";
import { reportUserAction } from "@/lib/social/safety-actions";
import { getDictionary } from "@/i18n";

interface UserReportModalProps {
  readonly isOpen: boolean;
  readonly targetUser: { readonly id: string; readonly name: string; readonly username: string } | null;
  readonly conversationId?: string;
  readonly onClose: () => void;
  readonly onBlocked?: (userId: string) => void;
}

export function UserReportModal({
  isOpen,
  targetUser,
  conversationId,
  onClose,
  onBlocked,
}: UserReportModalProps) {
  const dict = getDictionary();
  const [category, setCategory] = useState<ReportCategoryId>("harassment");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const res = await reportUserAction({
      targetUserId: targetUser.id,
      category,
      details: details.trim() || undefined,
      conversationId,
      alsoBlock,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        alsoBlock
          ? `${dict.social.reportModal.blockedAndReportedPrefix}${targetUser.username} ${dict.social.reportModal.blockedAndReportedSuffix}`
          : dict.social.reportModal.reportedToast
      );
      if (alsoBlock) onBlocked?.(targetUser.id);
      setDetails("");
      onClose();
    } else {
      toast.error(res.error ?? dict.social.reportModal.errorFallback);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${dict.social.reportModal.dialogAriaPrefix}${targetUser.username}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <h3 className="text-sm font-bold text-neutral-900">{dict.social.reportModal.titlePrefix}{targetUser.username}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.social.reportModal.closeAria}
            className="rounded-full p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <fieldset className="space-y-1.5">
            <legend className="text-xs font-bold text-neutral-800 mb-1.5">{dict.social.reportModal.categoryLegend}</legend>
            {REPORT_CATEGORIES.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs cursor-pointer transition-colors ${
                  category === item.id
                    ? "border-[var(--primary)] bg-red-50/40 font-bold text-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="radio"
                  name="report-category"
                  value={item.id}
                  checked={category === item.id}
                  onChange={() => setCategory(item.id)}
                  className="accent-[var(--primary)]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="report-details" className="block text-xs font-bold text-neutral-800 mb-1">
              {dict.social.reportModal.detailsLabel}
            </label>
            <textarea
              id="report-details"
              rows={2}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={dict.social.reportModal.detailsPlaceholder}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-600 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <label className="flex items-start gap-2.5 rounded-xl bg-[var(--surface)] p-2.5 text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
              className="mt-0.5 accent-[var(--primary)]"
            />
            <span>
              <strong>{dict.social.reportModal.alsoBlockPrefix}{targetUser.username}</strong> {dict.social.reportModal.alsoBlockSuffix}
            </span>
          </label>

          {conversationId && (
            <p className="text-[11px] leading-relaxed text-neutral-500">
              {dict.social.reportModal.conversationConsent}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {dict.social.reportModal.cancelButton}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {isSubmitting ? dict.social.reportModal.submitting : dict.social.reportModal.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
