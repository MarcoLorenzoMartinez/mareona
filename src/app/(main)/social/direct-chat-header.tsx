// Client: Cabecera del chat directo con perfil del interlocutor y opciones de seguridad (bloqueo y denuncia)
"use client";

import { useState } from "react";
import { ArrowLeft, MoreVertical, Ban, Flag } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { toast } from "@/lib/ui/toast";
import { blockUserAction } from "@/lib/social/safety-actions";
import { UserReportModal } from "./user-report-modal";
import { getDictionary } from "@/i18n";

interface DirectChatHeaderProps {
  readonly conversationId: string;
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
  conversationId,
  otherUser,
  onBack,
  onOpenProfile,
}: DirectChatHeaderProps) {
  const dict = getDictionary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlock = async () => {
    if (isBlocking) return;
    setIsBlocking(true);
    setMenuOpen(false);
    const res = await blockUserAction({ targetUserId: otherUser.id });
    setIsBlocking(false);

    if (res.success) {
      toast.success(`${dict.social.messages.blockedToastPrefix}${otherUser.username}`);
      onBack();
    } else {
      toast.error(res.error ?? dict.social.messages.blockErrorFallback);
    }
  };

  return (
    <div className="relative flex items-center gap-3 border-b border-[var(--border)] bg-white px-3 py-2.5">
      <button
        type="button"
        onClick={onBack}
        aria-label={dict.social.messages.backToInboxAria}
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
          <p className="truncate text-[11px] text-neutral-600">@{otherUser.username}</p>
        </div>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={dict.social.messages.safetyMenuAria}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-[var(--surface)] hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label={dict.social.messages.safetyMenuLabel}
            className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setReportOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <Flag className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
              <span>{dict.social.messages.reportConversation}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              disabled={isBlocking}
              onClick={handleBlock}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-[var(--primary)] hover:bg-red-50/60 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <Ban className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.social.messages.blockUserPrefix}{otherUser.username}</span>
            </button>
          </div>
        )}
      </div>

      <UserReportModal
        isOpen={reportOpen}
        targetUser={otherUser}
        conversationId={conversationId}
        onClose={() => setReportOpen(false)}
        onBlocked={() => onBack()}
      />
    </div>
  );
}
