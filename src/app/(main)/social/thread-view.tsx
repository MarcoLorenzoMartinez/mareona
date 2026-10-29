// Client: Vista de conversación enfocada e interactiva (modelo muñeca rusa)
"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { HeartLikeIcon } from "@/components/social/heart-like-icon";
import { useAuth } from "@/context/auth-context";
import { createSocialPost } from "@/lib/social/actions";
import { formatRelativeTime } from "./post-card";
import { ThreadReplyItem } from "./thread-reply-item";
import type { SocialPost } from "@/lib/social/types";

interface ThreadViewProps {
  readonly post: SocialPost;
  readonly parentPost?: SocialPost | null;
  readonly onBack: () => void;
  readonly onDrillDown: (postId: string) => void;
  readonly onAddReply: (parentId: string, newReply: SocialPost) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function ThreadView({
  post,
  parentPost,
  onBack,
  onDrillDown,
  onAddReply,
  onOpenProfile,
}: ThreadViewProps) {
  const { user, profile, openAuthModal } = useAuth();
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = () => {
    setLikes((prev) => (hasLiked ? Math.max(0, prev - 1) : prev + 1));
    setHasLiked(!hasLiked);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!user) {
      openAuthModal("signin");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const res = await createSocialPost({ body: replyText.trim(), parentId: post.id });
    setIsSubmitting(false);

    if (!res.success || !res.data) {
      setError(res.error ?? "No se pudo enviar la respuesta");
      return;
    }

    onAddReply(post.id, {
      ...res.data,
      authorName: profile?.display_name || profile?.username || "Aficionado",
      authorUsername: profile?.username || "aficionado",
      authorAvatar: profile?.avatar_url || null,
    });
    setReplyText("");
  };

  const replies = post.replies ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la conversación anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Conversación</h2>
          {parentPost && (
            <p className="text-[11px] text-neutral-400">
              En respuesta a @{parentPost.authorUsername}
            </p>
          )}
        </div>
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div onClick={() => post.userId && onOpenProfile?.(post.userId)} className="cursor-pointer hover:opacity-85">
            <AuthAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => post.userId && onOpenProfile?.(post.userId)}
              className="text-sm font-bold text-neutral-900 truncate hover:underline hover:text-[var(--primary)] text-left cursor-pointer"
            >
              {post.authorName}
            </button>
            <button
              type="button"
              onClick={() => post.userId && onOpenProfile?.(post.userId)}
              className="text-xs text-neutral-400 hover:text-neutral-600 block cursor-pointer"
            >
              @{post.authorUsername}
            </button>
          </div>
          <span className="text-xs text-neutral-400">{formatRelativeTime(post.createdAt)}</span>
        </div>

        <p className="mt-4 text-base text-neutral-900 leading-relaxed whitespace-pre-line">{post.body}</p>

        <div className="mt-4 flex items-center gap-6 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <button
            type="button"
            onClick={toggleLike}
            className={`group flex items-center gap-1.5 transition-colors cursor-pointer ${
              hasLiked ? "text-[var(--primary)] font-bold" : "text-neutral-500 hover:text-[var(--primary)]"
            }`}
          >
            <HeartLikeIcon filled={hasLiked} />
            <span className="tabular-nums font-sans">{likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <MessageSquare className="h-4 w-4" />
            <span className="tabular-nums font-sans">{replies.length} respuestas</span>
          </div>
        </div>
      </article>

      <form onSubmit={handleReplySubmit} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs space-y-2.5">
        <textarea
          rows={2}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Responder a @${post.authorUsername}...`}
          maxLength={500}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none resize-none"
        />
        {error && <p className="text-xs text-[var(--primary)]">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-sans tabular-nums">{500 - replyText.length} car.</span>
          <button
            type="submit"
            disabled={isSubmitting || !replyText.trim()}
            className="rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Responder"}
          </button>
        </div>
      </form>

      <section aria-label="Respuestas al mensaje" className="space-y-2.5 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
          Respuestas
        </h3>
        {replies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-400">
            No hay respuestas aún. Sé el primero en continuar la conversación.
          </div>
        ) : (
          replies.map((reply) => (
            <ThreadReplyItem
              key={reply.id}
              reply={reply}
              onDrillDown={onDrillDown}
              onOpenProfile={onOpenProfile}
            />
          ))
        )}
      </section>
    </div>
  );
}
