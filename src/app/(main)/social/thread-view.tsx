// Client: Vista de conversación enfocada (modelo muñeca rusa) con encuesta, acciones y borrado
"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollDisplay } from "@/components/social/poll-display";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "./post-actions";
import { PostComposer } from "./post-composer";
import { ThreadReplyItem } from "./thread-reply-item";
import { formatRelativeTime } from "@/lib/social/format";
import type { SocialPost } from "@/lib/social/types";

interface ThreadViewProps {
  readonly post: SocialPost;
  readonly parentPost?: SocialPost | null;
  readonly onBack: () => void;
  readonly onDrillDown: (postId: string) => void;
  readonly onAddReply: (parentId: string, newReply: SocialPost) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDeletePost?: (postId: string) => void;
}

export function ThreadView({
  post,
  parentPost,
  onBack,
  onDrillDown,
  onAddReply,
  onOpenProfile,
  onDeletePost,
}: ThreadViewProps) {
  const { user } = useAuth();
  const replies = post.replies ?? [];
  const openProfile = () => {
    if (post.userId) onOpenProfile?.(post.userId);
  };
  const isOwner = Boolean(user && user.id === post.userId);
  const { cleanBody, lineup } = parsePostLineup(post.body);

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-3 py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la conversación anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 transition-colors duration-150 hover:bg-[var(--surface)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-neutral-900">Conversación</h2>
          {parentPost && (
            <p className="truncate text-xs text-neutral-500">
              En respuesta a @{parentPost.authorUsername}
            </p>
          )}
        </div>
      </div>

      <article className="border-b border-[var(--border)] px-4 pt-4 pb-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={openProfile}
              aria-label={`Ver perfil de ${post.authorName}`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <AuthAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
            </button>
            <div className="min-w-0 flex-1 leading-tight">
              <button
                type="button"
                onClick={openProfile}
                className="block max-w-full truncate text-left text-sm font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                {post.authorName}
              </button>
              <span className="block truncate text-sm text-neutral-500">@{post.authorUsername}</span>
            </div>
          </div>

          {isOwner && onDeletePost && (
            <button
              type="button"
              onClick={() => onDeletePost(post.id)}
              aria-label="Borrar publicación"
              className="shrink-0 p-2 text-neutral-400 hover:bg-red-50 hover:text-[#e2001a] rounded-full transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {cleanBody && (
          <p className="mt-3 whitespace-pre-line break-words text-[19px] leading-snug text-neutral-900">
            {cleanBody}
          </p>
        )}

        {lineup && <SharedLineupPitchCard lineup={lineup} />}

        {post.poll && <PollDisplay poll={post.poll} />}

        <time dateTime={post.createdAt} className="mt-3 block text-sm text-neutral-500">
          {formatRelativeTime(post.createdAt)}
        </time>

        <div className="mt-2 border-t border-[var(--border)] pt-1">
          <PostActions
            likesCount={post.likesCount}
            repliesCount={replies.length}
            postId={post.id}
            postBody={cleanBody || post.body}
          />
        </div>
      </article>

      <PostComposer
        parentId={post.id}
        placeholder={`Responder a @${post.authorUsername}`}
        submitLabel="Responder"
        onPosted={(reply) => onAddReply(post.id, reply)}
      />

      <section aria-label="Respuestas al mensaje">
        {replies.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">Aún no hay respuestas</p>
        ) : (
          replies.map((reply) => (
            <ThreadReplyItem
              key={reply.id}
              reply={reply}
              onDrillDown={onDrillDown}
              onOpenProfile={onOpenProfile}
              onDelete={onDeletePost}
            />
          ))
        )}
      </section>
    </div>
  );
}
