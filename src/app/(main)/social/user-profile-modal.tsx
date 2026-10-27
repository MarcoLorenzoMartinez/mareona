// Client: Modal de perfil de usuario estilo Twitter con publicaciones y acciones
"use client";

import { useState, useEffect, useTransition } from "react";
import { X, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ProfileModalHeader } from "./user-profile-modal-header";
import { getUserSocialProfile } from "@/lib/social/user-profile-actions";
import { sendFriendRequest, removeFriendship, respondFriendRequest } from "@/lib/social/friends-actions";
import { formatRelativeTime } from "./post-card";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-neutral-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
          aria-label="Cerrar perfil"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading || !profile ? (
          <div className="py-16 text-center text-xs text-neutral-400">Cargando perfil...</div>
        ) : (
          <>
            <ProfileModalHeader
              profile={profile}
              isCurrentUser={isCurrentUser}
              onSendRequest={handleSendRequest}
              onRemoveFriend={handleRemoveFriend}
              isPendingAction={isPendingAction}
            />

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Publicaciones en la tertulia ({posts.length})
              </h4>

              {posts.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-400">
                  Este aficionado aún no ha compartido publicaciones en la tertulia.
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
                    className="cursor-pointer rounded-xl border border-neutral-100 p-3 hover:border-neutral-300 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-700">{profile.displayName || profile.username}</span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-800 leading-relaxed line-clamp-3">{post.body}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400">
                      <MessageSquare className="h-3 w-3" />
                      <span>Ver tema en la tertulia</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
