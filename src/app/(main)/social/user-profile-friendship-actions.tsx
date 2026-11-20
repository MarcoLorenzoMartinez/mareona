// Client: Botones de amistad, chat y bloqueo en la cabecera del modal de perfil
"use client";

import Link from "next/link";
import { UserPlus, UserCheck, UserX, MessageSquare, Ban } from "lucide-react";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";
import { getDictionary } from "@/i18n";

interface UserProfileFriendshipActionsProps {
  readonly profile: UserSocialProfile;
  readonly isCurrentUser: boolean;
  readonly isBlocked: boolean;
  readonly isBlockBusy: boolean;
  readonly isPendingAction: boolean;
  readonly onClose: () => void;
  readonly onToggleBlock: () => void;
  readonly onSendRequest: () => void;
  readonly onRemoveFriend: () => void;
  readonly onOpenChat?: () => void;
}

export function UserProfileFriendshipActions({
  profile,
  isCurrentUser,
  isBlocked,
  isBlockBusy,
  isPendingAction,
  onClose,
  onToggleBlock,
  onSendRequest,
  onRemoveFriend,
  onOpenChat,
}: UserProfileFriendshipActionsProps) {
  const dict = getDictionary();

  if (isCurrentUser) {
    return (
      <Link
        href="/perfil"
        onClick={onClose}
        className="inline-flex min-h-9 items-center rounded-full border border-[var(--border)] bg-white px-4 text-xs font-bold text-neutral-900 transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        {dict.social.userProfileModal.editProfileLink}
      </Link>
    );
  }

  if (isBlocked) {
    return (
      <button
        type="button"
        onClick={onToggleBlock}
        disabled={isBlockBusy}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-[var(--primary)] hover:bg-red-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
      >
        <Ban className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{dict.social.userProfileModal.unblockButton}</span>
      </button>
    );
  }

  return (
    <div>
      {profile.friendshipStatus === "accepted" && (
        <div className="flex items-center gap-1.5">
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.social.userProfileModal.messageButton}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRemoveFriend}
            disabled={isPendingAction}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50 cursor-pointer"
          >
            <UserX className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dict.social.userProfileModal.removeFriendButton}</span>
          </button>
        </div>
      )}
      {profile.friendshipStatus === "pending_sent" && (
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--surface)] px-3.5 text-xs font-semibold text-neutral-500">
          <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{dict.social.userProfileModal.requestSentBadge}</span>
        </span>
      )}
      {profile.friendshipStatus === "pending_received" && (
        <button
          type="button"
          onClick={onSendRequest}
          disabled={isPendingAction}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
        >
          <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{dict.social.userProfileModal.acceptRequestButton}</span>
        </button>
      )}
      {profile.friendshipStatus === "none" && (
        <button
          type="button"
          onClick={onSendRequest}
          disabled={isPendingAction}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{dict.social.userProfileModal.connectButton}</span>
        </button>
      )}
    </div>
  );
}
