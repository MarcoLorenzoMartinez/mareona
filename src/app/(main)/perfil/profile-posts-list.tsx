// Client: Timeline de publicaciones propias del usuario en su perfil
"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/ui/toast";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostActions } from "@/app/(main)/social/post-actions";
import { PostDeleteButton } from "@/app/(main)/social/post-delete-button";
import { PostOriginBadge } from "@/app/(main)/social/post-origin-badge";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { deleteSocialPost } from "@/lib/social/actions";
import {
  filterPostsByOrigin,
  formatRelativeTime,
  type PostOriginFilter,
} from "@/lib/social/format";
import { getUserSocialProfile } from "@/lib/social/user-profile-actions";
import type { SocialPost } from "@/lib/social/types";

const ORIGIN_TABS: readonly { readonly id: PostOriginFilter; readonly label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "social", label: "Social" },
  { id: "grada", label: "Grada" },
];

interface ProfilePostsListProps {
  readonly userId: string;
  readonly displayName: string;
  readonly username: string;
  readonly avatarUrl: string | null | undefined;
}

export function ProfilePostsList({
  userId,
  displayName,
  username,
  avatarUrl,
}: ProfilePostsListProps) {
  const [posts, setPosts] = useState<readonly SocialPost[]>([]);
  const [originFilter, setOriginFilter] = useState<PostOriginFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUserSocialProfile(userId).then((res) => {
      if (cancelled) return;
      setPosts(res.posts);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleDeletePost = async (postId: string) => {
    const previous = posts;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    const res = await deleteSocialPost({ postId });
    if (!res.success) {
      setPosts(previous);
      toast.error(res.error ?? "No se pudo borrar la publicación");
      return;
    }
    toast.success("Publicación eliminada");
  };

  const filteredPosts = filterPostsByOrigin(posts, originFilter);
  const emptyMessage =
    originFilter === "social"
      ? "Aún no has publicado en Social"
      : originFilter === "grada"
        ? "Aún no has publicado en Grada"
        : "Aún no has publicado en la tertulia";

  return (
    <section aria-label="Mis publicaciones">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-white px-4 py-2.5 sm:px-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Publicaciones{" "}
          {!isLoading && (
            <span className="font-sans tabular-nums text-neutral-400">
              ({filteredPosts.length})
            </span>
          )}
        </h2>

        <div
          role="group"
          aria-label="Filtrar publicaciones por origen"
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5"
        >
          {ORIGIN_TABS.map((tab) => {
            const isActive = originFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setOriginFilter(tab.id)}
                className={`rounded-full px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isActive
                    ? "bg-[var(--primary)] font-bold text-white"
                    : "font-medium text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-10 text-center text-xs text-neutral-400">
          Cargando publicaciones...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-semibold text-neutral-600">{emptyMessage}</p>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const { cleanBody, lineup } = parsePostLineup(post.body);
          return (
            <article
              key={post.id}
              className="flex gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-[var(--surface)]/60 sm:px-5"
            >
              <AuthAvatar src={avatarUrl} alt={displayName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                    <span className="truncate font-bold text-neutral-900">
                      {displayName}
                    </span>
                    <span className="truncate text-neutral-500">@{username}</span>
                    <span aria-hidden="true" className="text-neutral-400">·</span>
                    <time
                      dateTime={post.createdAt}
                      className="shrink-0 text-xs text-neutral-500"
                    >
                      {formatRelativeTime(post.createdAt)}
                    </time>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <PostOriginBadge
                      matchId={post.matchId}
                      matchLabel={post.matchLabel}
                    />
                    <PostDeleteButton onConfirm={() => handleDeletePost(post.id)} />
                  </div>
                </div>
                {cleanBody && (
                  <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
                    {cleanBody}
                  </p>
                )}
                {lineup && <SharedLineupPitchCard lineup={lineup} />}
                <PostActions
                  likesCount={post.likesCount}
                  repliesCount={post.repliesCount ?? 0}
                  postId={post.id}
                  postBody={cleanBody || post.body}
                />
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
