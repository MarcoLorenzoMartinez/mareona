// Client: Diálogo accesible para confirmación irreversible de eliminación de cuenta (RGPD)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/auth/actions";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";

interface DeleteAccountDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * Irreversible account and personal data deletion dialog compliant with GDPR Art. 17.
 * Accessible with keyboard ESC dismissal, ARIA landmarks and explicit confirmation.
 */
export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { handleSignOut } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteAccount();
    if (!res.success) {
      setIsDeleting(false);
      toast.error(res.error ?? "No se pudo eliminar la cuenta. Inténtalo de nuevo.");
      return;
    }

    await handleSignOut();
    toast.success("Tu cuenta y datos personales han sido eliminados.");
    router.push("/");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <svg
            className="h-6 w-6 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2
            id="delete-account-title"
            className="text-lg font-bold text-neutral-900"
          >
            ¿Eliminar tu cuenta y datos?
          </h2>
        </div>

        <p id="delete-account-desc" className="text-xs leading-relaxed text-neutral-600">
          Esta acción es <strong className="text-neutral-900">definitiva e irreversible</strong>.
          Conforme a tu derecho al olvido (RGPD), se suprimirán inmediatamente tus datos
          de acceso, apodo, pronósticos de la porra, participaciones en juegos y comentarios en la
          tertulia.
        </p>

        <div className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs text-red-800">
          No podrás recuperar tus puntos acumulados ni tu historial sportinguista una vez confirmada
          la eliminación.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="min-h-9 rounded-full border border-[var(--border)] bg-white px-4 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="min-h-9 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}
