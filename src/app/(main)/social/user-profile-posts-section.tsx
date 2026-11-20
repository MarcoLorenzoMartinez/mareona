// Client: Lista de publicaciones del aficionado dentro del modal de perfil
"use client";

import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostOriginBadge } from "./post-origin-badge";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { formatRelativeTime } from "@/lib/social/format";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";
import type { SocialPost } from "@/lib/social/types";

interface UserProfilePostsSectionProps {
  readonly profile: UserSocialProfile;
  readonly posts: readonly SocialPost[];
  readonly onOpenThread: (postId: string) => void;
  readonly onClose: () => void;
}

export function UserProfilePostsSection({
  profile,
  posts,
  onOpenThread,
  onClose,
}: UserProfilePostsSectionProps) {
  const displayName = profile.displayName || profile.username;

  return (
    <div>
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
        posts.map((post) => {
          const { cleanBody, lineup } = parsePostLineup(post.body);
          return (
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
              <AuthAvatar src={profile.avatarUrl} alt={displayName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                    <span className="truncate font-bold text-neutral-900">{displayName}</span>
                    <span className="truncate text-neutral-500">@{profile.username}</span>
                    <span aria-hidden="true" className="text-neutral-400">·</span>
                    <time dateTime={post.createdAt} className="shrink-0 text-xs text-neutral-500">
                      {formatRelativeTime(post.createdAt)}
                    </time>
                  </div>
                  <PostOriginBadge
                    matchId={post.matchId}
                    matchLabel={post.matchLabel}
                  />
                </div>
                {cleanBody && (
                  <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-snug text-neutral-900">
                    {cleanBody}
                  </p>
                )}
                {lineup && <SharedLineupPitchCard lineup={lineup} />}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
