"use client"; // Client: Manejo de acciones disciplinarias y apertura de modal de baneo

import { useState, useTransition } from "react";
import Image from "next/image";
import type { DisciplinaryUser } from "@/lib/admin/types";
import { unbanUserAction, resetUserAvatarAction } from "@/lib/admin/user-actions";
import { BanUserModal } from "./ban-user-modal";
import { toast } from "@/lib/ui/toast";

interface UserRowCardProps {
  readonly user: DisciplinaryUser;
}

/**
 * Disciplinary user row displaying account health, karma points, and administrative controls.
 */
export function UserRowCard({ user }: UserRowCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUnban() {
    startTransition(async () => {
      const res = await unbanUserAction(user.id);
      if (res.success) {
        toast.success(`Sanción levantada para @${user.username}`);
      } else {
        toast.error("Error al levantar sanción", { description: res.error });
      }
    });
  }

  function handleResetAvatar() {
    startTransition(async () => {
      const res = await resetUserAvatarAction(user.id);
      if (res.success) {
        toast.success(`Avatar restablecido para @${user.username}`);
      } else {
        toast.error("Error al restablecer avatar", { description: res.error });
      }
    });
  }

  return (
    <>
      <article className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold text-xs text-[var(--muted-foreground)]">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              user.username.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--foreground)]">
                {user.displayName || user.username}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                @{user.username}
              </span>

              {user.isBanned ? (
                <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                  Sancionado
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  Activo
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] tabular-nums">
              <span>{user.points} pts</span>
              <span>•</span>
              <span>Alta: {new Date(user.createdAt).toLocaleDateString("es-ES")}</span>
              {user.isBanned && user.bannedReason && (
                <>
                  <span>•</span>
                  <span className="text-rose-700 max-w-xs truncate" title={user.bannedReason}>
                    Motivo: {user.bannedReason}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          {user.avatarUrl && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleResetAvatar}
              className="min-h-[44px] rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-50"
            >
              Resetear foto
            </button>
          )}

          {user.isBanned ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleUnban}
              className="min-h-[44px] rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            >
              {isPending ? "Levantando..." : "Levantar sanción"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsModalOpen(true)}
              className="min-h-[44px] rounded-full bg-[var(--brand,#e2001a)] px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              Sancionar cuenta
            </button>
          )}
        </div>
      </article>

      <BanUserModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
