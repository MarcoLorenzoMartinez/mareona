"use client"; // Client: Modal accesible para seleccionar duración y motivo del baneo

import { useState, useTransition } from "react";
import { banUserAction } from "@/lib/admin/user-actions";
import { toast } from "@/lib/ui/toast";
import type { DisciplinaryUser } from "@/lib/admin/types";

interface BanUserModalProps {
  readonly user: DisciplinaryUser;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: "1 día (advertencia)", value: 1 },
  { label: "3 días (derbi/incidencia)", value: 3 },
  { label: "7 días (falta grave)", value: 7 },
  { label: "30 días (reiteración)", value: 30 },
  { label: "Indefinido / Permanente", value: null },
] as const;

/**
 * Accessible modal dialog to configure and apply a temporary or permanent user ban.
 */
export function BanUserModal({ user, isOpen, onClose }: BanUserModalProps) {
  const [duration, setDuration] = useState<number | null>(7);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Debes indicar un motivo para aplicar la sanción");
      return;
    }

    startTransition(async () => {
      const res = await banUserAction({
        userId: user.id,
        reason: reason.trim(),
        durationDays: duration,
      });

      if (res.success) {
        toast.success(`Cuenta @${user.username} sancionada correctamente`);
        onClose();
      } else {
        toast.error("Error al aplicar la sanción", { description: res.error });
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ban-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
        <h2 id="ban-modal-title" className="text-lg font-bold text-[var(--foreground)]">
          Sancionar a @{user.username}
        </h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          La cuenta no podrá emitir mensajes, porras ni participar en actividades sociales.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="duration-select" className="block text-xs font-semibold text-[var(--foreground)]">
              Duración de la sanción
            </label>
            <select
              id="duration-select"
              value={duration ?? "permanent"}
              onChange={(e) => {
                const val = e.target.value;
                setDuration(val === "permanent" ? null : Number(val));
              }}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white p-2.5 text-sm text-[var(--foreground)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value ?? "permanent"}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ban-reason" className="block text-xs font-semibold text-[var(--foreground)]">
              Motivo formal (mínimo 3 caracteres)
            </label>
            <textarea
              id="ban-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Insultos reiterados y provocación en la tertulia..."
              className="mt-1 w-full rounded-xl border border-[var(--border)] p-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="min-h-[44px] rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] rounded-full bg-[var(--brand,#e2001a)] px-5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Aplicando..." : "Confirmar Sanción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
