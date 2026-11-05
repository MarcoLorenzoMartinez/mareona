// Client: Fila de publicación del timeline; el clic abre el hilo
"use client";

import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostActions } from "./post-actions";
import { PostAuthorLine } from "./post-author-line";
import type { SocialPost } from "@/lib/social/types";

interface PostCardProps {
  readonly post: SocialPost;
  readonly onOpenThread: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function PostCard({ post, onOpenThread, onOpenProfile }: PostCardProps) {
  const repliesCount = post.repliesCount ?? post.replies?.length ?? 0;
  const openThread = () => onOpenThread(post.id);

  // The row is a mouse shortcut only; keyboard users reach the thread through the replies button.
  return (
    <article
      onClick={openThread}
      className="flex cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--surface)]/60"
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
        <AuthAvatar src={post.authorAvatar} alt="" size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine post={post} onOpenProfile={onOpenProfile} />
        <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
          {post.body}
        </p>
        <PostActions
          likesCount={post.likesCount}
          repliesCount={repliesCount}
          onOpenThread={openThread}
        />
      </div>
    </article>
  );
}
