// Client: Fila de publicación del timeline con encuesta, acciones y borrado propio
"use client";

import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollDisplay } from "@/components/social/poll-display";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "./post-actions";
import { PostAuthorLine } from "./post-author-line";
import type { SocialPost } from "@/lib/social/types";

interface PostCardProps {
  readonly post: SocialPost;
  readonly onOpenThread: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: (postId: string) => void;
}

export function PostCard({
  post,
  onOpenThread,
  onOpenProfile,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const repliesCount = post.repliesCount ?? post.replies?.length ?? 0;
  const openThread = () => onOpenThread(post.id);
  const isOwner = Boolean(user && user.id === post.userId);
  const { cleanBody, lineup } = parsePostLineup(post.body);

  return (
    <article
      onClick={openThread}
      tabIndex={0}
      role="button"
      aria-label={`Publicación de ${post.authorName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openThread();
        }
      }}
      className="flex cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--surface)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (post.userId) onOpenProfile?.(post.userId);
        }}
        aria-label={`Ver perfil de ${post.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine
          post={post}
          onOpenProfile={onOpenProfile}
          onDelete={isOwner && onDelete ? () => onDelete(post.id) : undefined}
        />
        {cleanBody && (
          <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
            {cleanBody}
          </p>
        )}

        {lineup && <SharedLineupPitchCard lineup={lineup} />}

        {post.poll && <PollDisplay poll={post.poll} />}

        <PostActions
          likesCount={post.likesCount}
          repliesCount={repliesCount}
          onOpenThread={openThread}
          postId={post.id}
          postBody={cleanBody || post.body}
        />
      </div>
    </article>
  );
}
