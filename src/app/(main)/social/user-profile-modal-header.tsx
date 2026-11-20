// Client: Cabecera con datos, acciones de amistad y controles de seguridad (bloqueo/denuncia)
"use client";

import { useState } from "react";
import { Ban, Flag } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { toast } from "@/lib/ui/toast";
import { blockUserAction, unblockUserAction } from "@/lib/social/safety-actions";
import { UserReportModal } from "./user-report-modal";
import { UserProfileFriendshipActions } from "./user-profile-friendship-actions";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";
import { getDictionary } from "@/i18n";

interface ProfileModalHeaderProps {
  readonly profile: UserSocialProfile;
  readonly isCurrentUser: boolean;
  readonly onSendRequest: () => void;
  readonly onRemoveFriend: () => void;
  readonly onOpenChat?: () => void;
  readonly onClose: () => void;
  readonly isPendingAction: boolean;
  readonly onBlockStateChange?: (isBlocked: boolean) => void;
}

export function ProfileModalHeader({
  profile,
  isCurrentUser,
  onSendRequest,
  onRemoveFriend,
  onOpenChat,
  onClose,
  isPendingAction,
  onBlockStateChange,
}: ProfileModalHeaderProps) {
  const dict = getDictionary();
  const [isBlockBusy, setIsBlockBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const memberSince = (() => {
    try {
      return new Date(profile.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    } catch {
      return dict.social.userProfileModal.recentMemberFallback;
    }
  })();

  const displayName = profile.displayName || profile.username;
  const isBlocked = Boolean(profile.isBlockedByMe);

  const handleToggleBlock = async () => {
    if (isBlockBusy) return;
    setIsBlockBusy(true);
    const res = isBlocked
      ? await unblockUserAction({ targetUserId: profile.id })
      : await blockUserAction({ targetUserId: profile.id });
    setIsBlockBusy(false);

    if (res.success) {
      toast.success(
        isBlocked
          ? `${dict.social.userProfileModal.unblockedToastPrefix}${profile.username}`
          : `${dict.social.userProfileModal.blockedToastPrefix}${profile.username}`
      );
      onBlockStateChange?.(!isBlocked);
    } else {
      toast.error(res.error ?? dict.social.userProfileModal.blockErrorFallback);
    }
  };

  return (
    <div className="border-b border-[var(--border)] bg-white px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <AuthAvatar src={profile.avatarUrl} alt={displayName} size="lg" />

        <UserProfileFriendshipActions
          profile={profile}
          isCurrentUser={isCurrentUser}
          isBlocked={isBlocked}
          isBlockBusy={isBlockBusy}
          isPendingAction={isPendingAction}
          onClose={onClose}
          onToggleBlock={handleToggleBlock}
          onSendRequest={onSendRequest}
          onRemoveFriend={onRemoveFriend}
          onOpenChat={onOpenChat}
        />
      </div>

      <div className="mt-3">
        <h3 className="text-base font-bold text-neutral-900 truncate">{displayName}</h3>
        <p className="text-xs text-neutral-500">@{profile.username}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <div className="flex items-center gap-x-2">
          <span>{dict.social.userProfileModal.sincePrefix} {memberSince}</span>
        </div>

        {!isCurrentUser && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleToggleBlock} disabled={isBlockBusy} className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs cursor-pointer">
              <Ban className="h-3 w-3" aria-hidden="true" />
              <span>{isBlocked ? dict.social.userProfileModal.unblockButton : dict.social.userProfileModal.blockButton}</span>
            </button>
            <button type="button" onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs cursor-pointer">
              <Flag className="h-3 w-3" aria-hidden="true" />
              <span>{dict.social.userProfileModal.reportButton}</span>
            </button>
          </div>
        )}
      </div>

      <UserReportModal
        isOpen={reportOpen}
        targetUser={{ id: profile.id, name: displayName, username: profile.username }}
        onClose={() => setReportOpen(false)}
        onBlocked={() => onBlockStateChange?.(true)}
      />
    </div>
  );
}
