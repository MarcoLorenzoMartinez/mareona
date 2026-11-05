// Client: Timeline de comentarios del partido con navegación en hilo idéntica a Social
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { MatchCommentComposer } from "./match-comment-composer";
import {
  MobileMatchCommentFab,
  MobileMatchCommentModal,
} from "./mobile-match-comment-composer";
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
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState<readonly MatchComment[]>(initialComments);
  const [navigationStack, setNavigationStack] = useState<readonly string[]>([]);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);

  const handlePushThread = (commentId: string) => {
    setNavigationStack((prev) => [...prev, commentId]);
  };

  const handlePopThread = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  const handleCommentCreated = (added: MatchComment) => {
    setComments((prev) => [added, ...prev]);
  };

  const handleAddReply = (parentId: string, reply: MatchComment) => {
    setComments((prev) => addReplyToCommentTree(prev, parentId, reply));
  };

  useEffect(() => {
    if (navigationStack.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlePopThread();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigationStack.length]);

  const activeCommentId = navigationStack[navigationStack.length - 1];
  const focusedComment = activeCommentId ? findCommentInTree(comments, activeCommentId) : null;
  const parentComment = activeCommentId ? findParentInCommentTree(comments, activeCommentId) : null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
        {focusedComment ? (
          <MatchThreadView
            matchId={matchId}
            comment={focusedComment}
            parentComment={parentComment}
            onBack={handlePopThread}
            onDrillDown={handlePushThread}
            onAddReply={handleAddReply}
            onOpenProfile={(id) => setViewingProfileId(id)}
          />
        ) : (
          <>
            <MatchCommentComposer
              matchId={matchId}
              onCommented={handleCommentCreated}
              className="hidden sm:flex"
            />

            <section aria-label="Comentarios del partido">
              {comments.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm font-semibold text-neutral-600">
                  Aún no hay comentarios sobre este partido
                </p>
              ) : (
                comments.map((comment) => (
                  <MatchCommentCard
                    key={comment.id}
                    comment={comment}
                    onOpenThread={handlePushThread}
                    onOpenProfile={(id) => setViewingProfileId(id)}
                  />
                ))
              )}
            </section>
          </>
        )}

        <UserProfileModal
          userId={viewingProfileId}
          onClose={() => setViewingProfileId(null)}
          onOpenThread={handlePushThread}
        />

        <MobileMatchCommentFab
          onClick={() => {
            if (!user) {
              openAuthModal("signin");
              return;
            }
            setIsMobileComposerOpen(true);
          }}
        />
        <MobileMatchCommentModal
          matchId={matchId}
          isOpen={isMobileComposerOpen}
          onClose={() => setIsMobileComposerOpen(false)}
          onCommented={handleCommentCreated}
        />
      </div>
    </div>
  );
}
