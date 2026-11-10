// Client: Cabecera con datos del aficionado y botón de retroceso para el chat directo
"use client";

import { ArrowLeft } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";

interface DirectChatHeaderProps {
  readonly otherUser: {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly avatarUrl: string | null;
  };
  readonly onBack: () => void;
  readonly onOpenProfile: (userId: string) => void;
}

export function DirectChatHeader({
  otherUser,
  onBack,
  onOpenProfile,
}: DirectChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-3 py-2.5">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver a la lista de mensajes"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-[var(--surface)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onOpenProfile(otherUser.id)}
        className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer hover:opacity-90"
      >
        <AuthAvatar src={otherUser.avatarUrl} alt={otherUser.name} size="sm" />
        <div className="min-w-0">
          <h3 className="truncate text-xs font-bold text-neutral-900">{otherUser.name}</h3>
          <p className="truncate text-[11px] text-neutral-400">@{otherUser.username}</p>
        </div>
      </button>
    </div>
  );
}
