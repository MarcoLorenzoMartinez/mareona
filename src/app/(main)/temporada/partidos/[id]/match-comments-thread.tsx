// Client: Hilo de comentarios del partido con navegación muñeca rusa idéntica a social
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { createMatchComment } from "@/lib/match-community/actions";
import { MatchCommentCard } from "./match-comment-card";
import { MatchThreadView } from "./match-thread-view";
import { UserProfileModal } from "@/app/(main)/social/user-profile-modal";
import {
  findCommentInTree,
  findParentInCommentTree,
  addReplyToCommentTree,
} from "@/lib/match-community/comment-tree-nav";
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
  const [navigationStack, setNavigationStack] = useState<readonly string[]>([]);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePushThread = (commentId: string) => {
    setNavigationStack((prev) => [...prev, commentId]);
  };

  const handlePopThread = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (navigationStack.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlePopThread();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigationStack.length]);

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
        replies: [],
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
        replies: [],
      };
      setComments((prev) => addReplyToCommentTree(prev, parentId, replyComment));
    }
  };

  const activeCommentId = navigationStack[navigationStack.length - 1];
  const focusedComment = activeCommentId ? findCommentInTree(comments, activeCommentId) : null;
  const parentComment = activeCommentId ? findParentInCommentTree(comments, activeCommentId) : null;

  return (
    <div className="space-y-4">
      {focusedComment ? (
        <MatchThreadView
          comment={focusedComment}
          parentComment={parentComment}
          onBack={handlePopThread}
          onDrillDown={handlePushThread}
          onAddReply={handleReply}
          onOpenProfile={(id) => setViewingProfileId(id)}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <textarea
                rows={3}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Comenta sobre la previa, el juego o el resultado..."
                maxLength={500}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none resize-none"
              />
              {error && <p className="text-xs text-[var(--primary)]">{error}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-sans tabular-nums">{500 - newText.length} car.</span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newText.trim()}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer"
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
                  onOpenThread={handlePushThread}
                  onOpenProfile={(id) => setViewingProfileId(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de perfil al pulsar en avatar o autor */}
      <UserProfileModal
        userId={viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        onOpenThread={handlePushThread}
      />
    </div>
  );
}
