// Client: Modal de perfil de aficionado con información, publicaciones y acciones de contacto
"use client";

import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import { ProfileModalHeader } from "./user-profile-modal-header";
import { UserProfilePostsSection } from "./user-profile-posts-section";
import { getUserSocialProfile } from "@/lib/social/user-profile-actions";
import { sendFriendRequest, removeFriendship, respondFriendRequest } from "@/lib/social/friends-actions";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";
import type { SocialPost } from "@/lib/social/types";
import { getDictionary } from "@/i18n";

interface UserProfileModalProps {
  readonly userId: string | null;
  readonly onClose: () => void;
  readonly onOpenThread: (postId: string) => void;
  readonly onStartChat?: (user: {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly avatarUrl: string | null;
  }) => void;
}

export function UserProfileModal({
  userId,
  onClose,
  onOpenThread,
  onStartChat,
}: UserProfileModalProps) {
  const dict = getDictionary();
  const { user, openAuthModal } = useAuth();
  const [profile, setProfile] = useState<UserSocialProfile | null>(null);
  const [posts, setPosts] = useState<readonly SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingAction, startTransition] = useTransition();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getUserSocialProfile(userId).then((res) => {
      if (cancelled) return;
      setProfile(res.profile);
      setPosts(res.posts);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [userId, onClose]);

  if (!userId) return null;
  const isCurrentUser = user?.id === userId;

  const handleSendRequest = () => {
    if (!user) {
      onClose();
      openAuthModal("signin");
      toast.info(dict.social.userProfileModal.signInForFriendRequestToast);
      return;
    }
    if (!profile) return;

    startTransition(async () => {
      if (profile.friendshipStatus === "pending_received" && profile.friendshipId) {
        if (!profile.friendshipId.startsWith("demo-")) {
          await respondFriendRequest({ friendshipId: profile.friendshipId, action: "accept" });
        }
        setProfile((prev) => (prev ? { ...prev, friendshipStatus: "accepted" } : null));
        toast.success(dict.social.userProfileModal.requestAcceptedToast);
      } else {
        if (userId.startsWith("demo-")) {
          setProfile((prev) =>
            prev ? { ...prev, friendshipStatus: "pending_sent", friendshipId: `demo-friendship-${userId}` } : null
          );
          toast.success(dict.social.userProfileModal.requestSentToast);
          return;
        }

        const res = await sendFriendRequest({ addresseeId: userId });
        if (res.success) {
          setProfile((prev) =>
            prev ? { ...prev, friendshipStatus: "pending_sent", friendshipId: res.data?.friendshipId } : null
          );
          toast.success(dict.social.userProfileModal.requestSentToast);
        } else {
          toast.error(res.error || dict.social.userProfileModal.requestErrorFallback);
        }
      }
    });
  };

  const handleRemoveFriend = () => {
    const fId = profile?.friendshipId;
    if (!fId) return;
    startTransition(async () => {
      if (!fId.startsWith("demo-")) {
        await removeFriendship(fId);
      }
      setProfile((prev) => (prev ? { ...prev, friendshipStatus: "none", friendshipId: undefined } : null));
      toast.success(dict.social.userProfileModal.friendRemovedToast);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.social.userProfileModal.dialogAria}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 sm:px-5">
          <h2 className="text-sm font-bold text-neutral-900">{dict.social.userProfileModal.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.social.userProfileModal.closeAria}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-[var(--surface)] hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {isLoading || !profile ? (
          <div className="py-16 text-center text-xs text-neutral-400">{dict.social.userProfileModal.loading}</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ProfileModalHeader
              profile={profile}
              isCurrentUser={isCurrentUser}
              onSendRequest={handleSendRequest}
              onRemoveFriend={handleRemoveFriend}
              onOpenChat={() => {
                onClose();
                onStartChat?.({
                  id: profile.id,
                  name: profile.displayName || profile.username,
                  username: profile.username,
                  avatarUrl: profile.avatarUrl,
                });
              }}
              onClose={onClose}
              isPendingAction={isPendingAction}
              onBlockStateChange={(blocked) =>
                setProfile((prev) =>
                  prev ? { ...prev, isBlockedByMe: blocked, friendshipStatus: blocked ? "none" : prev.friendshipStatus, friendshipId: blocked ? undefined : prev.friendshipId } : null
                )
              }
            />

            <UserProfilePostsSection
              profile={profile}
              posts={posts}
              onOpenThread={onOpenThread}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
