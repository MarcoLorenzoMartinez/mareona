// Client: Timeline de publicaciones propias del usuario en su perfil
"use client";

import { useEffect, useState } from "react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostActions } from "@/app/(main)/social/post-actions";
import { formatRelativeTime } from "@/lib/social/format";
import { getUserSocialProfile } from "@/lib/social/user-profile-actions";
import type { SocialPost } from "@/lib/social/types";

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

  return (
    <section aria-label="Mis publicaciones">
      <div className="border-b border-[var(--border)] bg-white px-4 py-2.5 sm:px-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Publicaciones{" "}
          {!isLoading && (
            <span className="font-sans tabular-nums text-neutral-400">
              ({posts.length})
            </span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="px-4 py-10 text-center text-xs text-neutral-400">
          Cargando publicaciones...
        </div>
      ) : posts.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-semibold text-neutral-600">
            Aún no has publicado en la tertulia
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <article
            key={post.id}
            className="flex gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-[var(--surface)]/60 sm:px-5"
          >
            <AuthAvatar src={avatarUrl} alt="" size="md" />
            <div className="min-w-0 flex-1">
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
              <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
                {post.body}
              </p>
              <PostActions
                likesCount={post.likesCount}
                repliesCount={post.repliesCount ?? 0}
              />
            </div>
          </article>
        ))
      )}
    </section>
  );
}
