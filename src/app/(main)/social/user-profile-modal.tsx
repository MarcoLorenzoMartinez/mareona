// Client: Modal de perfil de usuario estilo timeline con publicaciones y acciones
"use client";

import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { ProfileModalHeader } from "./user-profile-modal-header";
import { getUserSocialProfile } from "@/lib/social/user-profile-actions";
import { sendFriendRequest, removeFriendship, respondFriendRequest } from "@/lib/social/friends-actions";
import { formatRelativeTime } from "@/lib/social/format";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";
import type { SocialPost } from "@/lib/social/types";

interface UserProfileModalProps {
  readonly userId: string | null;
  readonly onClose: () => void;
  readonly onOpenThread: (postId: string) => void;
}

export function UserProfileModal({ userId, onClose, onOpenThread }: UserProfileModalProps) {
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

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
      openAuthModal("signin");
      return;
    }
    if (!profile) return;

    startTransition(async () => {
      if (profile.friendshipStatus === "pending_received" && profile.friendshipId) {
        await respondFriendRequest({ friendshipId: profile.friendshipId, action: "accept" });
        setProfile((prev) => (prev ? { ...prev, friendshipStatus: "accepted" } : null));
      } else {
        const res = await sendFriendRequest({ addresseeId: userId });
        if (res.success) {
          setProfile((prev) =>
            prev ? { ...prev, friendshipStatus: "pending_sent", friendshipId: res.data?.friendshipId } : null
          );
        }
      }
    });
  };

  const handleRemoveFriend = () => {
    if (!profile?.friendshipId) return;
    startTransition(async () => {
      await removeFriendship(profile.friendshipId!);
      setProfile((prev) => (prev ? { ...prev, friendshipStatus: "none", friendshipId: undefined } : null));
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Perfil del aficionado"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 sm:px-5">
          <h2 className="text-sm font-bold text-neutral-900">Perfil</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-[var(--surface)] hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {isLoading || !profile ? (
          <div className="py-16 text-center text-xs text-neutral-400">Cargando perfil...</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ProfileModalHeader
              profile={profile}
              isCurrentUser={isCurrentUser}
              onSendRequest={handleSendRequest}
              onRemoveFriend={handleRemoveFriend}
              onClose={onClose}
              isPendingAction={isPendingAction}
            />

            <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 px-4 py-2 sm:px-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Publicaciones{" "}
                <span className="font-sans tabular-nums text-neutral-400">({posts.length})</span>
              </h4>
            </div>

            {posts.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm font-semibold text-neutral-600">
                Aún no ha publicado en la tertulia
              </p>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => {
                    onClose();
                    onOpenThread(post.id);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onClose();
                      onOpenThread(post.id);
                    }
                  }}
                  className="flex cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-[var(--surface)]/60 sm:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
                >
                  <AuthAvatar src={profile.avatarUrl} alt="" size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                      <span className="truncate font-bold text-neutral-900">
                        {profile.displayName || profile.username}
                      </span>
                      <span className="truncate text-neutral-500">@{profile.username}</span>
                      <span aria-hidden="true" className="text-neutral-400">·</span>
                      <time dateTime={post.createdAt} className="shrink-0 text-xs text-neutral-500">
                        {formatRelativeTime(post.createdAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-snug text-neutral-900">
                      {post.body}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
