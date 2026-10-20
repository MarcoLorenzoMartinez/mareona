// Client: Hilo de comentarios del partido
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createMatchComment } from "@/lib/match-community/actions";
import { MatchCommentCard } from "./match-comment-card";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchCommentsThreadProps {
  readonly matchId: string;
  readonly initialComments: readonly MatchComment[];
}

export function MatchCommentsThread({
  matchId,
  initialComments,
}: MatchCommentsThreadProps) {
  const { user, profile, openAuthModal } = useAuth();
  const [comments, setComments] = useState<readonly MatchComment[]>(initialComments);
  const [newText, setNewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    if (!user) {
      openAuthModal("signin");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await createMatchComment({
      matchId,
      body: newText.trim(),
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error ?? "No se pudo publicar el comentario");
      return;
    }

    if (res.data) {
      const added: MatchComment = {
        ...res.data,
        authorName: profile?.display_name || profile?.username || "Aficionado",
        authorUsername: profile?.username || "aficionado",
        authorAvatar: profile?.avatar_url || null,
      };
      setComments((prev) => [added, ...prev]);
      setNewText("");
    }
  };

  const handleReply = async (parentId: string, body: string) => {
    const res = await createMatchComment({
      matchId,
      body,
      parentId,
    });

    if (res.success && res.data) {
      const replyComment: MatchComment = {
        ...res.data,
        authorName: profile?.display_name || profile?.username || "Aficionado",
        authorUsername: profile?.username || "aficionado",
        authorAvatar: profile?.avatar_url || null,
      };

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies ?? []), replyComment] };
          }
          return c;
        })
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Caja para comentar */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <textarea
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Comenta sobre la previa, el juego o el resultado..."
            maxLength={500}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none resize-none transition-colors"
          />

          {error && <p className="text-xs text-[var(--primary)]">{error}</p>}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-sans tabular-nums">
              {500 - newText.length} car.
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !newText.trim()}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Comentar"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de comentarios */}
      {comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-400">
          Aún no hay comentarios sobre este partido. ¡Sé el primero en opinar!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <MatchCommentCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
